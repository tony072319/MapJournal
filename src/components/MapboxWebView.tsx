import React, { useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { MAPBOX_TOKEN } from '../constants/mapbox';
import { UserLocation } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MarkerData {
  latitude: number;
  longitude: number;
  emoji: string;
  id: string;
  moodColor: string;
  count?: number;
}

interface Props {
  location: UserLocation;
  markers?: MarkerData[];
  onMarkerPress?: (id: string) => void;
  height?: number;
}

export const MapboxWebView: React.FC<Props> = ({
  location,
  markers = [],
  onMarkerPress,
  height = SCREEN_HEIGHT,
}) => {
  const webViewRef = useRef<WebView>(null);
  const markersJSON = useMemo(() => JSON.stringify(markers), [markers]);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress' && onMarkerPress) {
        onMarkerPress(data.id);
      }
    } catch {}
  }, [onMarkerPress]);

  React.useEffect(() => {
    webViewRef.current?.injectJavaScript(`
      if(window.updateMarkers) window.updateMarkers(${markersJSON});
      true;
    `);
  }, [markersJSON]);

  React.useEffect(() => {
    webViewRef.current?.injectJavaScript(`
      if(window.updateUserLocation) window.updateUserLocation(${location.latitude}, ${location.longitude});
      true;
    `);
  }, [location.latitude, location.longitude]);

  const html = useMemo(() => generateHTML(location, markers), []);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsInlineMediaPlayback
      />
    </View>
  );
};

function generateHTML(location: UserLocation, initialMarkers: MarkerData[]): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
<style>
* { margin:0; padding:0; box-sizing:border-box; }
html,body { width:100%; height:100%; overflow:hidden; background:#F4EDE4; }
#map { width:100%; height:100%; }
.mapboxgl-ctrl-logo,.mapboxgl-ctrl-attrib { display:none !important; }

#paper-texture {
  position:absolute; top:0; left:0; right:0; bottom:0;
  pointer-events:none; z-index:2;
  background-repeat:repeat;
}
#vignette {
  position:absolute; top:0; left:0; right:0; bottom:0;
  pointer-events:none; z-index:3;
  box-shadow: inset 0 0 120px rgba(80,60,40,0.1);
}

.marker-container { cursor:pointer; position:relative; }
.marker-bubble {
  display:flex; align-items:center; justify-content:center;
  width:46px; height:46px; border-radius:23px;
  background:#FFFFFF; border:2px solid rgba(124,108,240,0.25);
  box-shadow: 0 3px 12px rgba(100,80,60,0.12);
  position:relative; transition:transform 0.15s;
}
.marker-bubble:active { transform:scale(0.92); }
.marker-inner {
  width:38px; height:38px; border-radius:19px;
  display:flex; align-items:center; justify-content:center; font-size:20px;
}
.marker-badge {
  position:absolute; top:-5px; right:-5px;
  background:linear-gradient(135deg,#FF7EB3,#FF5A8A); color:white;
  font-size:10px; font-weight:800; min-width:20px; height:20px;
  border-radius:10px; display:flex; align-items:center; justify-content:center;
  padding:0 5px; border:2px solid #FFF;
}

.user-dot-wrapper { position:relative; width:22px; height:22px; }
.user-dot-pulse {
  position:absolute; top:-7px; left:-7px; width:36px; height:36px;
  border-radius:50%; background:rgba(124,108,240,0.12);
  animation:pulse 2s ease-out infinite;
}
.user-dot {
  position:absolute; top:2px; left:2px; width:18px; height:18px;
  border-radius:50%; background:#7C6CF0;
  border:3px solid #FFFFFF;
  box-shadow:0 2px 8px rgba(124,108,240,0.35);
}
@keyframes pulse {
  0% { transform:scale(0.8); opacity:1; }
  100% { transform:scale(2.2); opacity:0; }
}

.controls {
  position:absolute; right:14px; top:100px;
  display:flex; flex-direction:column; gap:6px; z-index:20;
}
.ctrl-btn {
  width:36px; height:36px; border-radius:18px;
  background:rgba(255,255,255,0.88); border:1px solid rgba(180,170,155,0.3);
  display:flex; align-items:center; justify-content:center;
  font-size:17px; font-weight:300; color:#6B6058;
  box-shadow:0 2px 8px rgba(80,60,40,0.08);
  cursor:pointer; -webkit-tap-highlight-color:transparent;
  backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
}
.ctrl-btn:active { background:rgba(255,255,255,1); transform:scale(0.92); }
.loc-icon {
  width:14px; height:14px; border-radius:7px;
  border:2px solid #7C6CF0;
  display:flex; align-items:center; justify-content:center;
}
.loc-dot { width:4px; height:4px; border-radius:50%; background:#7C6CF0; }
.attr {
  position:absolute; bottom:4px; left:8px;
  font-size:8px; color:rgba(107,96,88,0.2);
  font-family:-apple-system,sans-serif; z-index:20;
}
.decor-marker { pointer-events:none; }
</style>
</head>
<body>
<div id="map"></div>
<div id="paper-texture"></div>
<div id="vignette"></div>
<div class="controls">
  <button class="ctrl-btn" onclick="zoomIn()">+</button>
  <button class="ctrl-btn" onclick="zoomOut()">\u2212</button>
  <div style="height:6px"></div>
  <button class="ctrl-btn" onclick="recenter()">
    <div class="loc-icon"><div class="loc-dot"></div></div>
  </button>
</div>
<div class="attr">\u00a9 Mapbox \u00a9 OpenStreetMap</div>

<script>
mapboxgl.accessToken = '${MAPBOX_TOKEN}';
var userLat = ${location.latitude};
var userLng = ${location.longitude};
var markerElements = [];

var map = new mapboxgl.Map({
  container: 'map',
  center: [userLng, userLat],
  zoom: 15.5,
  style: {
    version: 8,
    sources: {
      composite: {
        url: 'mapbox://mapbox.mapbox-streets-v8',
        type: 'vector'
      }
    },
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    layers: [
      { id:'bg', type:'background', paint:{ 'background-color':'#F4EDE4' } },
      { id:'landuse-green', type:'fill', source:'composite', 'source-layer':'landuse',
        filter:['in','class','park','pitch','grass','cemetery','scrub'],
        paint:{ 'fill-color':'#D5DFCA', 'fill-opacity':0.5 } },
      { id:'water', type:'fill', source:'composite', 'source-layer':'water',
        paint:{ 'fill-color':'#C4D7E0' } },
      { id:'waterway', type:'line', source:'composite', 'source-layer':'waterway',
        paint:{ 'line-color':'#B0C8D6', 'line-width':['interpolate',['linear'],['zoom'],8,0.5,14,1.5,18,3] } },
      { id:'building', type:'fill', source:'composite', 'source-layer':'building',
        minzoom:14,
        paint:{ 'fill-color':'#ECE6DC', 'fill-opacity':['interpolate',['linear'],['zoom'],14,0,15,0.5], 'fill-outline-color':'#DDD6CA' } },
      { id:'rd-hw-cas', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','motorway','trunk','motorway_link','trunk_link'],
        minzoom:5, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#CCC4B0', 'line-width':['interpolate',['exponential',1.5],['zoom'],5,0.5,12,3,18,22] } },
      { id:'rd-pri-cas', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','primary','primary_link'],
        minzoom:7, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#D5CFC0', 'line-width':['interpolate',['exponential',1.5],['zoom'],7,0.5,12,2,18,18] } },
      { id:'rd-sec-cas', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','secondary','secondary_link','tertiary','tertiary_link'],
        minzoom:9, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#DDD5C5', 'line-width':['interpolate',['exponential',1.5],['zoom'],9,0.3,12,1.5,18,14] } },
      { id:'rd-min-cas', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','street','street_limited','service'],
        minzoom:12, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#DDD5C5', 'line-width':['interpolate',['exponential',1.5],['zoom'],12,0.3,18,10] } },
      { id:'rd-hw', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','motorway','trunk','motorway_link','trunk_link'],
        minzoom:5, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#FFFFFF', 'line-width':['interpolate',['exponential',1.5],['zoom'],5,0.2,12,2,18,18] } },
      { id:'rd-pri', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','primary','primary_link'],
        minzoom:7, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#FFFFFF', 'line-width':['interpolate',['exponential',1.5],['zoom'],7,0.2,12,1.2,18,14] } },
      { id:'rd-sec', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','secondary','secondary_link','tertiary','tertiary_link'],
        minzoom:9, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#FFFFFF', 'line-width':['interpolate',['exponential',1.5],['zoom'],9,0.1,12,0.8,18,10] } },
      { id:'rd-min', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','street','street_limited','service'],
        minzoom:12, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#FAF6EE', 'line-width':['interpolate',['exponential',1.5],['zoom'],12,0.1,18,7] } },
      { id:'rd-path', type:'line', source:'composite', 'source-layer':'road',
        filter:['in','class','path','pedestrian','track'],
        minzoom:14, layout:{ 'line-cap':'round','line-join':'round' },
        paint:{ 'line-color':'#CCC4B4', 'line-width':1, 'line-dasharray':[2,2] } },
      { id:'admin', type:'line', source:'composite', 'source-layer':'admin',
        filter:['>=','admin_level',2],
        paint:{ 'line-color':'#C8C0B0', 'line-width':0.8, 'line-dasharray':[3,2] } },
      { id:'place-label', type:'symbol', source:'composite', 'source-layer':'place_label',
        minzoom:4,
        layout:{
          'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],
          'text-font':['DIN Pro Medium','Arial Unicode MS Regular'],
          'text-size':['interpolate',['linear'],['zoom'],4,10,12,16,16,18],
          'text-max-width':8, 'text-letter-spacing':0.05
        },
        paint:{ 'text-color':'#6B6058', 'text-halo-color':'#F4EDE4', 'text-halo-width':1.5, 'text-halo-blur':0.5 } },
      { id:'road-label', type:'symbol', source:'composite', 'source-layer':'road',
        minzoom:12,
        layout:{
          'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],
          'text-font':['DIN Pro Regular','Arial Unicode MS Regular'],
          'text-size':['interpolate',['linear'],['zoom'],12,9,16,12],
          'symbol-placement':'line', 'text-max-angle':30,
          'text-rotation-alignment':'map', 'text-pitch-alignment':'viewport'
        },
        paint:{ 'text-color':'#8A8278', 'text-halo-color':'#F4EDE4', 'text-halo-width':1, 'text-halo-blur':0.3 } },
      { id:'poi-label', type:'symbol', source:'composite', 'source-layer':'poi_label',
        minzoom:15,
        layout:{
          'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],
          'text-font':['DIN Pro Regular','Arial Unicode MS Regular'],
          'text-size':10, 'text-max-width':6
        },
        paint:{ 'text-color':'#9B9488', 'text-halo-color':'#F4EDE4', 'text-halo-width':1, 'text-halo-blur':0.3 } }
    ]
  },
  attributionControl: false,
  pitch: 0,
  bearing: 0
});

map.on('load', function() {
  document.querySelectorAll('.mapboxgl-ctrl-logo').forEach(function(el){ el.style.display='none'; });
  // Paper texture
  var tc = document.createElement('canvas');
  tc.width=128; tc.height=128;
  var ctx = tc.getContext('2d');
  var imgData = ctx.createImageData(128,128);
  for(var i=0;i<imgData.data.length;i+=4){
    var v=Math.floor(Math.random()*255);
    imgData.data[i]=v; imgData.data[i+1]=v; imgData.data[i+2]=v; imgData.data[i+3]=5;
  }
  ctx.putImageData(imgData,0,0);
  document.getElementById('paper-texture').style.backgroundImage='url('+tc.toDataURL()+')';

  scatterDecorations();
  addUserMarker();
  if(window.pendingMarkers){ updateMarkers(window.pendingMarkers); window.pendingMarkers=null; }
});

// Watercolor SVG decorations
var DECOR_SVGS = {
  tealTree: '<svg width="36" height="44" viewBox="0 0 36 44"><ellipse cx="18" cy="16" rx="14" ry="12" fill="#7CC5C8" opacity="0.45"/><ellipse cx="13" cy="12" rx="7" ry="6" fill="#9DDDE0" opacity="0.35"/><ellipse cx="23" cy="19" rx="6" ry="5" fill="#5DABB0" opacity="0.3"/><rect x="16" y="26" width="4" height="10" rx="2" fill="#A09080" opacity="0.5"/></svg>',
  amberTree: '<svg width="34" height="42" viewBox="0 0 34 42"><ellipse cx="17" cy="15" rx="13" ry="12" fill="#E8B876" opacity="0.5"/><ellipse cx="12" cy="11" rx="7" ry="6" fill="#F0D0A0" opacity="0.35"/><ellipse cx="22" cy="18" rx="6" ry="5" fill="#D4944A" opacity="0.3"/><rect x="15" y="25" width="4" height="10" rx="2" fill="#A09080" opacity="0.5"/></svg>',
  sageTree: '<svg width="32" height="40" viewBox="0 0 32 40"><ellipse cx="16" cy="14" rx="12" ry="11" fill="#8CB882" opacity="0.45"/><ellipse cx="11" cy="10" rx="6" ry="5" fill="#A8D09A" opacity="0.35"/><ellipse cx="21" cy="17" rx="5" ry="5" fill="#6A9A5E" opacity="0.3"/><rect x="14" y="23" width="4" height="10" rx="2" fill="#A09080" opacity="0.5"/></svg>',
  pine: '<svg width="22" height="48" viewBox="0 0 22 48"><path d="M11 4 L4 18 L8 18 L2 30 L7 30 L1 42 L21 42 L15 30 L20 30 L14 18 L18 18 Z" fill="#6B9C5E" opacity="0.45"/><path d="M11 4 L7 14 L11 14 L6 24 L11 24 Z" fill="#8BBE7A" opacity="0.2"/><rect x="9" y="40" width="4" height="6" rx="1" fill="#A09080" opacity="0.5"/></svg>',
  bareBranch: '<svg width="28" height="40" viewBox="0 0 28 40"><path d="M14 38 L14 16 M14 16 L6 6 M14 16 L22 8 M14 22 L5 18 M14 22 L23 16 M14 28 L8 25 M14 28 L20 24" stroke="#9B8B74" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5"/></svg>',
  pagoda: '<svg width="48" height="56" viewBox="0 0 48 56"><path d="M10 22 Q24 14 38 22 L36 24 L12 24 Z" fill="#C8564A" opacity="0.5" stroke="#8B3A30" stroke-width="0.6"/><rect x="16" y="24" width="16" height="8" fill="#E8D8C4" opacity="0.55" stroke="#B0A090" stroke-width="0.5"/><path d="M6 36 Q24 28 42 36 L40 38 L8 38 Z" fill="#B8483C" opacity="0.5" stroke="#8B3A30" stroke-width="0.6"/><rect x="12" y="38" width="24" height="12" fill="#E8D8C4" opacity="0.55" stroke="#B0A090" stroke-width="0.5"/><rect x="20" y="42" width="8" height="8" fill="#5D3A1A" opacity="0.35"/></svg>',
  gate: '<svg width="50" height="40" viewBox="0 0 50 40"><path d="M2 14 Q25 5 48 14 L46 16 L4 16 Z" fill="#C8564A" opacity="0.45" stroke="#8B3A30" stroke-width="0.5"/><rect x="4" y="16" width="42" height="3" fill="#D4A050" opacity="0.45"/><rect x="8" y="19" width="5" height="16" fill="#8B7355" opacity="0.4"/><rect x="37" y="19" width="5" height="16" fill="#8B7355" opacity="0.4"/><rect x="16" y="22" width="18" height="13" fill="#F0E4D0" opacity="0.4" stroke="#B0A090" stroke-width="0.5"/></svg>',
  cloud: '<svg width="56" height="24" viewBox="0 0 56 24"><ellipse cx="12" cy="14" rx="10" ry="7" fill="#FFFFFF" opacity="0.55"/><ellipse cx="28" cy="11" rx="14" ry="9" fill="#FFFFFF" opacity="0.6"/><ellipse cx="44" cy="14" rx="10" ry="7" fill="#FFFFFF" opacity="0.5"/></svg>',
  birds: '<svg width="36" height="14" viewBox="0 0 36 14"><path d="M2 7 Q5 3 8 7 Q11 3 14 7" stroke="#8B8070" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.5"/><path d="M20 5 Q23 2 26 5" stroke="#8B8070" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.4"/><path d="M28 9 Q31 6 34 9" stroke="#8B8070" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.4"/></svg>',
  mountain: '<svg width="52" height="38" viewBox="0 0 52 38"><path d="M2 36 L18 10 L26 20 L36 6 L50 36 Z" fill="#B0BEC5" opacity="0.3"/><path d="M15 14 L18 10 L21 14 L18 12 Z" fill="#FFFFFF" opacity="0.5"/><path d="M33 10 L36 6 L39 10 L36 8 Z" fill="#FFFFFF" opacity="0.5"/></svg>',
  bamboo: '<svg width="24" height="46" viewBox="0 0 24 46"><line x1="7" y1="42" x2="7" y2="6" stroke="#7AA050" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/><line x1="12" y1="42" x2="12" y2="10" stroke="#5F8A38" stroke-width="2.5" stroke-linecap="round" opacity="0.35"/><line x1="17" y1="42" x2="17" y2="8" stroke="#7AA050" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/></svg>',
  bush: '<svg width="22" height="18" viewBox="0 0 22 18"><ellipse cx="11" cy="10" rx="9" ry="6" fill="#8CB882" opacity="0.35"/><ellipse cx="8" cy="8" rx="4" ry="3" fill="#A8D09A" opacity="0.25"/></svg>',
  flowers: '<svg width="24" height="22" viewBox="0 0 24 22"><circle cx="7" cy="9" r="4" fill="#E8A0B8" opacity="0.4"/><circle cx="16" cy="7" r="3.5" fill="#F0C878" opacity="0.4"/><circle cx="12" cy="15" r="3.5" fill="#D48098" opacity="0.35"/><circle cx="7" cy="9" r="1.5" fill="#FFF0D0" opacity="0.45"/><circle cx="16" cy="7" r="1.5" fill="#FFF0D0" opacity="0.45"/></svg>',
  lantern: '<svg width="18" height="34" viewBox="0 0 18 34"><rect x="5" y="26" width="8" height="4" fill="#A09888" opacity="0.45"/><rect x="4" y="22" width="10" height="5" fill="#B0A898" opacity="0.45"/><rect x="5" y="14" width="8" height="9" fill="#D4C8B4" opacity="0.45"/><circle cx="9" cy="19" r="2" fill="#F0D878" opacity="0.45"/><path d="M3 13 L15 13 L12 11 L6 11 Z" fill="#A09888" opacity="0.45"/></svg>'
};

var decorMarkers = [];
function scatterDecorations() {
  decorMarkers.forEach(function(m){ m.remove(); });
  decorMarkers = [];
  var seed = Math.floor(userLat*10000) + Math.floor(userLng*10000);
  function rand(){ seed=(seed*9301+49297)%233280; return seed/233280; }

  var typePool = [
    'tealTree','tealTree','tealTree','tealTree',
    'amberTree','amberTree','amberTree',
    'sageTree','sageTree','sageTree',
    'pine','pine',
    'bareBranch','bareBranch',
    'bamboo','bamboo',
    'bush','bush','bush',
    'flowers','flowers',
    'pagoda',
    'gate',
    'lantern','lantern',
    'cloud','cloud',
    'birds','birds',
    'mountain'
  ];

  var gridSize=9, cellStep=0.004;
  var startLat = userLat - (gridSize*cellStep)/2;
  var startLng = userLng - (gridSize*cellStep*1.3)/2;

  for(var gx=0; gx<gridSize; gx++){
    for(var gy=0; gy<gridSize; gy++){
      var cellCenterLat = startLat + gy*cellStep;
      var cellCenterLng = startLng + gx*cellStep*1.3;
      var dcx = gx - gridSize/2, dcy = gy - gridSize/2;
      var cellDist = Math.sqrt(dcx*dcx + dcy*dcy);
      if(cellDist < 1.2) continue;
      var decorPerCell = cellDist > 4 ? 1 : (rand() > 0.35 ? 2 : 1);
      for(var n=0; n<decorPerCell; n++){
        var jitLat = (rand()-0.5)*cellStep*0.85;
        var jitLng = (rand()-0.5)*cellStep*0.85*1.3;
        var lat = cellCenterLat + jitLat;
        var lng = cellCenterLng + jitLng;
        var type;
        var r = rand();
        if(cellDist > 3.5 && r < 0.08) type = 'cloud';
        else if(cellDist > 3 && r < 0.06) type = 'birds';
        else if(cellDist > 4 && r < 0.04) type = 'mountain';
        else type = typePool[Math.floor(rand()*typePool.length)];
        var svg = DECOR_SVGS[type];
        if(!svg) continue;
        var el = document.createElement('div');
        el.className = 'decor-marker';
        el.innerHTML = svg;
        var scale = 0.9 + rand()*0.6;
        var rotate = (rand()-0.5)*10;
        el.style.transform = 'scale('+scale+') rotate('+rotate+'deg)';
        el.style.pointerEvents = 'none';
        el.style.transformOrigin = 'center bottom';
        var marker = new mapboxgl.Marker({ element:el, anchor:'bottom' })
          .setLngLat([lng, lat]).addTo(map);
        decorMarkers.push(marker);
      }
    }
  }
}

var userMarker = null;
function addUserMarker(){
  var w = document.createElement('div');
  w.className = 'user-dot-wrapper';
  w.innerHTML = '<div class="user-dot-pulse"></div><div class="user-dot"></div>';
  userMarker = new mapboxgl.Marker({ element:w }).setLngLat([userLng,userLat]).addTo(map);
}

function createMarkerEl(m){
  var c = document.createElement('div');
  c.className = 'marker-container';
  var b = document.createElement('div');
  b.className = 'marker-bubble';
  b.style.borderColor = m.moodColor + '50';
  var inner = document.createElement('div');
  inner.className = 'marker-inner';
  inner.style.backgroundColor = m.moodColor + '18';
  inner.textContent = m.emoji;
  b.appendChild(inner);
  if(m.count && m.count > 1){
    var badge = document.createElement('div');
    badge.className = 'marker-badge';
    badge.textContent = m.count;
    b.appendChild(badge);
  }
  c.appendChild(b);
  c.addEventListener('click', function(e){
    e.stopPropagation();
    window.ReactNativeWebView.postMessage(JSON.stringify({ type:'markerPress', id:m.id }));
  });
  return c;
}

function updateMarkers(newMarkers){
  if(!map.isStyleLoaded()){ window.pendingMarkers=newMarkers; return; }
  markerElements.forEach(function(m){ m.remove(); });
  markerElements = [];
  newMarkers.forEach(function(m){
    var el = createMarkerEl(m);
    var marker = new mapboxgl.Marker({ element:el, anchor:'center' })
      .setLngLat([m.longitude, m.latitude]).addTo(map);
    markerElements.push(marker);
  });
}

function updateUserLocation(lat,lng){
  userLat=lat; userLng=lng;
  if(userMarker) userMarker.setLngLat([lng,lat]);
}
function zoomIn(){ map.zoomTo(map.getZoom()+1,{duration:300}); }
function zoomOut(){ map.zoomTo(map.getZoom()-1,{duration:300}); }
function recenter(){ map.flyTo({center:[userLng,userLat],zoom:15.5,pitch:0,bearing:0,duration:600}); }

window.updateMarkers = updateMarkers;
window.updateUserLocation = updateUserLocation;
updateMarkers(${JSON.stringify(initialMarkers)});
</script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: '#F4EDE4' },
});
