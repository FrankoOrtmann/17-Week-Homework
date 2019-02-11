
var EarthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_day.geojson"


var TectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the Earthquake query URL
d3.json(EarthquakeURL, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {       

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .5,
          stroke: true,
          color: "black",
          weight: .2
      })
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes)
}

function createMap(earthquakes) {

  // Define map layers
  var light = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
  });

  var street = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
  });
 

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": light,
    "Dark Map": dark,
    "Street Map": street
  };


  var tectonicPlates = new L.LayerGroup();

// Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates
  };

// --------------------------------------------------------

// Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [0, 0],
    zoom: 3,
    layers: [light, earthquakes, tectonicPlates]
  });

// --------------------------------------------------------

   d3.json(TectonicPlatesURL, function(plateData) {

     L.geoJson(plateData, {
       color: "blue",
       weight: 2
     })
     .addTo(tectonicPlates);
   });


  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// --------------------------------------------------------

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
              grades = [1, 2, 3, 4, 5],
              labels = [];

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}

// --------------------------------------------------------

// create function to give colors to earthquake magnitude.
function getColor(d) {
  if (d > 5) {
      return "black"
  } else if (d > 4) {
      return "red"
  } else if (d > 3) {
      return "orange"
  } else if (d > 2) {
      return "yellow"
  } else (d > 1) 
      return "white"
  };


// function to make circles bigger and easier to see on map
function getRadius(value){
  return value*50000
}




