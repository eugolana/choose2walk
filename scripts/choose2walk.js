

function initMap(qs) {
coords = [qs['lat'], qs['lng']]
if (qs['bw'] == "true") {
  layer_url = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
  color = 'black';
  opacity = 0.05;
} else {
  layer_url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  color = 'red';
  opacity = 0.05;
}
document.getElementById('description').innerText = qs['text']
var mymap = L.map('mapid',{
  zoomControl: false,
  dragging: false
  }
).setView(coords, 14)
L.tileLayer(layer_url, {
   maxZoom: 18,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mymap)

drawWalkCircles(coords, mymap)
}

function drawWalkCircles(coords, map) {

  var c1 = L.circle(coords, {
      stroke: '1px',
      color: color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.1,
      radius: 999
  }).addTo(map);
  l1 = getPolyLine(c1, -1 * Math.PI / 8 ).addTo(map)
  l1.setText("15 minute walk", {
    attributes: {
      'font-size': 20,
      fill: color
    }
  })

  var c2 = L.circle(coords, {
      weight: 2,
      color: color,
      fillColor: color,
      fillOpacity: 0.1,
      radius: 666
  }).addTo(map);
  l2 = getPolyLine(c2, -1 * Math.PI / 7 ).addTo(map)
  l2.setText("10 minute walk", {
    attributes: {
      'font-size': 15,
      fill: color
    }
  })

  var c3 = L.circle(coords, {
      weight: 2,
      color: color,
      fillColor: color,
      fillOpacity: 0.1,
      radius: 333
  }).addTo(map);
  l3 = getPolyLine(c3, -1 * Math.PI / 6).addTo(map)
  l3.setText("5 minute walk", {
    attributes: {
      'font-size': 10,
      fill: color,
    }
  })
  return [c1,c2,c3,l1,l2,l3]
}

function removeLayers(layers) {
  for (var i = 0; i < layers.length; i++) {
    layers[i].remove()
  }
}

function getQueryStrings() {
  var assoc  = {};
  var decode = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); };
  var queryString = location.search.substring(1);
  var keyValues = queryString.split('&');

  for(var i in keyValues) {
    var key = keyValues[i].split('=');
    if (key.length > 1) {
      assoc[decode(key[0])] = decode(key[1]);
    }
  }

  return assoc;
}

function getPolyLine(circle, angle_offset, r_offset) {
  angle_offset = angle_offset || -1 * Math.PI/4;
  r_offset = r_offset || -0.001
  b = circle.getBounds()
  center = b.getCenter()
  rx = (center.lng - b.getWest()) * 0.9
  ry = (center.lat - b.getSouth()) * 0.9
      points = []
  inc = Math.PI/20
  for (var i = 0; i < 10; i ++) {
    points.push([
      center.lat +  ry * Math.cos(angle_offset + inc * i),
      center.lng + rx * Math.sin(angle_offset + inc * i)])
  }
  line = L.polyline(points, {opacity: 0})
  return line
}
