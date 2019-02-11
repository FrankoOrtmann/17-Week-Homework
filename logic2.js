// Earthquake data link
var EarthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"

// Tectonic plates link
var TectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Perform a GET request to the Earthquake query URL
d3.json(EarthquakeURL, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {       

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: function (feature, layer){
      layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.properties.mag),
          fillOpacity: .7,
          stroke: true,
          color: "black",
          weight: .5
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

  // Add a tectonic plate layer
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [31.7, -7.09],
    zoom: 2.5,
    layers: [light, earthquakes, tectonicPlates]
  });

   // Add Fault lines data
   d3.json(k, function(plateData) {
     // Adding our geoJSON data, along with style information, to the tectonicplates
     // layer.
     L.geoJson(plateData, {
       color: "blue",
       weight: 2
     })
     .addTo(tectonicPlates);
   });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend'),
              grades = [0, 1, 2, 3, 4, 5],
              labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + Color(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}

function Color(d) {
  if (d > 5) {
      return "black"
  } else if (magnitude > 4) {
      return "red"
  } else if (magnitude > 3) {
      return "orange"
  } else if (magnitude > 2) {
      return "yellow"
  } else (magnitude > 1) {
      return "white"
  }
};

function getRadius(value){
  return value*40000
}




