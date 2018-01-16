var $ = function(id) {
   return document.getElementById(id);
};
var qs = function(sel) {
   return document.querySelector(sel);
};
var qsa = function(sel) {
   return document.querySelectorAll(sel);
};

// Setup data
var flying = {
   'sea': {
      'name': 'Seattle, WA',
      'center': [-122.33327865600585, 47.63844399027284],
      'zoom': 13,
      'pitch': 160,
      'bearing': -40
   },
   'sf': {
      'name': 'San Francisco, CA',
      'center': [-122.355211, 37.732369],
      'zoom': 10,
      'pitch': 200,
      'bearing': -5
   },
   'pr': {
      'name': 'San Juan, PR',
      'center': [-66.043085, 18.438823],
      'zoom': 12,
      'pitch': 200,
      'bearing': -5
   },
   'gr': {
      'name': 'Athens, GR',
      'center': [23.794936, 38.007590],
      'zoom': 10,
      'pitch': 200,
      'bearing': -5
   },
   'lv': {
      'name': 'Las Vegas, NV',
      'center': [-115.158428, 36.130694],
      'zoom': 12,
      'pitch': 200,
      'bearing': -5
   }
}

//Initialize map

mapboxgl.accessToken = 'pk.eyJ1IjoiZGJhYmJzIiwiYSI6ImNqN2d2aDBvczFkNmEycWt5OXo0YnY3ejkifQ.h1gKMs1F18_AhB09s91gWg';
var map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/dbabbs/cjbe0le5b9li92ro1wycon6s8',
   center: [-122.35021467990396, 47.623954436942995],
   zoom: 10,
   pitch: 60,
   bearing: -20
});

//Create fly menu in HTML
for (var i = 0; i < Object.keys(flying).length; i++) {
   var option = document.createElement('option');
   option.innerText = Object.values(flying)[i]['name'];
   option.id = Object.keys(flying)[i];
   $('flys').appendChild(option)
}

//Data for routes
var routes = {
   'source': {
      'data': './data/routes.geojson',
      'type': 'geojson'
   },
   'type': 'line',
   'id': 'routes',
   'paint': {
      'line-color': '#FFCF31',
      'line-opacity': 0.3,
      'line-width': 2
   },
   'layout': {
      'line-cap': 'round',
      'line-join': 'round'
   }
};

//Data for routes outline
var routesOutline = {
   'source': {
      'data': './data/routes.geojson',
      'type': 'geojson'
   },
   'type': 'line',
   'id': 'routesOutline',
   'paint': {
      'line-color': '#FFCF31',
      'line-opacity': 1,
      'line-width': 4
   },
   'layout': {
      'line-cap': 'round',
      'line-join': 'round'
   },
   'filter': ['==', 'id', '']
};

//Data for start points
var starts = {
   'id': 'starts',
   'type': 'fill-extrusion',
   'source': {
      'type': 'geojson',
      'data': './data/start.geojson'
   },
   'paint': {
      'fill-extrusion-color': '#E15B64',
      'fill-extrusion-height': {
         'property': 'height',
         'type': 'identity'
      },
      'fill-extrusion-base': {
         'property': 'base_height',
         'type': 'identity'
      },
      'fill-extrusion-opacity': 1
   }
}

//Data for end points
var ends = {
   'id': 'ends',
   'type': 'fill-extrusion',
   'source': {
      'type': 'geojson',
      'data': './data/end.geojson'
   },
   'paint': {
      'fill-extrusion-color': {
         'property': 'color',
         'type': 'identity'
      },
      'fill-extrusion-height': {
         'property': 'height',
         'type': 'identity'
      },
      'fill-extrusion-base': {
         'property': 'base_height',
         'type': 'identity'
      },
      'fill-extrusion-opacity': 1
   }
}

var months = ['January', 'February', 'March', 'April', 'May', 'June',
   'July', 'August', 'September', 'October', 'November', 'December'
];

map.on('load', function() {
   //Fly to Seattle on start for cool effect
   map.flyTo({
      center: flying.sea.center,
      zoom: flying.sea.zoom,
      pitch: flying.sea.pitch,
      bearing: flying.sea.bearing,
      speed: 0.3
   });

   map.addLayer(routes);
   map.addLayer(starts);
   map.addLayer(ends);
   map.addLayer(routesOutline);

   var popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
   });

   //Tooltip enter
   map.on('mouseover', 'routes', function(e) {
      var date = new Date(e.features[0].properties.date);
      var distance = (parseFloat(e.features[0].properties.distance) * 0.000621371).toFixed(1);
      var text = months[date.getMonth()] + ' ' + date.getFullYear() + ' • ' + distance + ' miles';
      popup.setLngLat(e.lngLat)
         .setHTML(text)
         .addTo(map);
   });

   //Tooltip end
   map.on('mouseenter', 'routes', function() {
      map.getCanvas().style.cursor = 'pointer';
   });

   // Change it back to a pointer when it leaves.
   map.on('mouseleave', 'routes', function() {
      map.getCanvas().style.cursor = '';
      popup.remove();

      //highlight select routes
      map.setFilter('routesOutline', ['==', 'id', '']);
      map.setPaintProperty('routes', 'line-opacity', 0.3);
   });

   map.on('mousemove', 'routes', function(e) {
      map.setFilter('routesOutline', ['==', 'id', e.features[0].properties.id]);
      map.setPaintProperty('routes', 'line-opacity', 0);
   });

});

//Side bar controls
$('flys').onchange = fly;

function fly() {
   var x = $('flys').options[$('flys').selectedIndex].id;
   map.flyTo({
      center: flying[x].center,
      zoom: flying[x].zoom,
      pitch: flying[x].pitch,
      bearing: flying[x].bearing
   });
}

$('start-control').onclick = function() {
   if ($('start-control').innerText == '(hide)') {
      map.removeLayer('starts');
      map.removeSource('starts');
      $('start-control').innerText = '(show)'
   } else if ($('start-control').innerText == '(show)') {
      map.addLayer(starts);
      $('start-control').innerText = '(hide)'
   }
}

$('end-control').onclick = function() {
   if ($('end-control').innerText == '(hide)') {
      map.removeLayer('ends');
      map.removeSource('ends');
      $('end-control').innerText = '(show)'
   } else if ($('end-control').innerText == '(show)') {
      map.addLayer(ends);
      $('end-control').innerText = '(hide)'
   }
}
