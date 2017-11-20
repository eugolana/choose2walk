function initMap(querystring) {
  // If qs is present.. (there is pre-validation so we can assume that its ok)
  if (querystring['posterMode'] == 'true'){
    initPosterView(querystring);
  } else {
    initEditView(querystring);
  }
}


function initPosterView(querystring){
  // hide edit <div>
  document.getElementById('editMode').style.display = 'none';

  var info = document.createElement('p')
  info.innerText = querystring['info']
  document.getElementById('info').appendChild(info)

  var slogan = document.createElement('p');
  slogan.innerText = querystring['slogan'] || "Walking is good for you.";
  document.getElementById('slogan').appendChild(slogan);

  // include querystring in backlink with 'posterMode=false'
  document.getElementById('backLink').href = String(window.location).replace("posterMode=true", "posterMode=false")

  var coords = [querystring['lat'], querystring['lng']];
  if (querystring['bw'] == "true") {
    var layer_url = 'http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png';
    var color = 'black';
    var opacity = 0.0;
  } else {
    var layer_url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var color = 'black';
    var opacity = 0.1;
  }

  // initialise map
  var mymap = L.map('mapid',{
    zoomControl: false,
    dragging: false
    }
  ).setView(coords, 14);
  L.tileLayer(layer_url, {
     maxZoom: 18,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mymap);
  // add concentric circles
  drawWalkCircles(coords, color, opacity, mymap);
}

function initEditView(qs) {
  document.getElementById('bgrnd').style.display = 'none';
  // styling/layout stuff
  document.getElementById('mapid').style.width = "320px";
  document.getElementById('mapid').style.height = "320px";
  document.getElementById('mapid').style.float = 'left';
  document.getElementById('backLink').style.display = 'none';
  // deault map centre (vaguely at the center of the UK)
  if (querystring['lat'] && querystring['lng']) {
    coords = [querystring['lat'], querystring['lng']]
    zoom = 18;
    // marker = L.marker(qs).addTo(mymap)
    document.getElementById('latEdit').value = querystring.lat
    document.getElementById('lngEdit').value = querystring.lng;
  } else {
    var coords = [53.693365, -1.486819];
    var zoom = 6;
    
  }
  if (querystring['info']) {
    document.getElementById('infoEdit').value = querystring['info']
  }
  if (querystring['slogan']) {
    document.getElementById('sloganEdit').value = querystring['slogan']
  }
  var layer_url = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var mymap = L.map('mapid').setView(coords, zoom);
  L.tileLayer(layer_url, {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(mymap);
  var marker;
  // this will add marker to map, remove old marker, and edit form fields with coordinates
  mymap.on('click', function(event) {
    if (marker != undefined) {
      marker.remove();
    }
    marker = L.marker(event.latlng).addTo(mymap)
    document.getElementById('latEdit').value = event.latlng.lat.toFixed(4);
    document.getElementById('lngEdit').value = event.latlng.lng.toFixed(4);
  })
}

function drawWalkCircles(coords, color, opacity, map) {
  // outer circle
  var c1 = L.circle(coords, {
      stroke: '2px',
      color: color,
      weight: 2,
      fillColor: '#FFFFFF',
      fillOpacity: opacity,
      radius: 999
  }).addTo(map);
  // outer text
  var l1 = getPolyLine(c1, -1 * Math.PI / 8 ).addTo(map);
  l1.setText("15 minute walk", {
    attributes: {
      'font-size': 20,
      fill: color
    }
  });

  // mid circle
  var c2 = L.circle(coords, {
      weight: 2,
      color: color,
      fillColor: '#FFFFFF',
      fillOpacity: opacity,
      radius: 666
  }).addTo(map);
  // mid text
  var l2 = getPolyLine(c2, -1 * Math.PI / 7 ).addTo(map);
  l2.setText("10 minute walk", {
    attributes: {
      'font-size': 15,
      fill: color
    }
  });

  // inner circle
  var c3 = L.circle(coords, {
      weight: 2,
      color: color,
      fillColor: '#FFFFFF',
      fillOpacity: opacity,
      radius: 333
  }).addTo(map);
  // inner text
  var l3 = getPolyLine(c3, -1 * Math.PI / 4, 0.85).addTo(map);
  l3.setText("5 minute walk", {
    attributes: {
      'font-size': 12,
      fill: color,
    }
  });
  // return an array of the objects (useful for removing later)
  return [c1,c2,c3,l1,l2,l3];
}

function removeLayers(layers) {
  for (var i = 0; i < layers.length; i++) {
    layers[i].remove();
  }
}

function getQueryStrings() {
  // Cheers to stackoverflow user Josh Stodola for this
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
  r_offset = r_offset || 0.9
  b = circle.getBounds()
  center = b.getCenter()
  rx = (center.lng - b.getWest()) * r_offset
  ry = (center.lat - b.getSouth()) * r_offset
      points = []
  inc = Math.PI/20
  for (var i = 0; i < 20; i ++) {
    points.push([
      center.lat +  ry * Math.cos(angle_offset + inc * i),
      center.lng + rx * Math.sin(angle_offset + inc * i)])
  }
  line = L.polyline(points, {opacity: 0})
  return line
}
