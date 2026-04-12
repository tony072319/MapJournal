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
        paint:{ 'fill-color':'#B8D4A8', 'fill-opacity':0.6 } },
      { id:'water', type:'fill', source:'composite', 'source-layer':'water',
        paint:{ 'fill-color':'#A8C8D8' } },
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
    imgData.data[i]=v; imgData.data[i+1]=v; imgData.data[i+2]=v; imgData.data[i+3]=18;
  }
  ctx.putImageData(imgData,0,0);
  document.getElementById('paper-texture').style.backgroundImage='url('+tc.toDataURL()+')';

  scatterDecorations();
  addUserMarker();
  if(window.pendingMarkers){ updateMarkers(window.pendingMarkers); window.pendingMarkers=null; }
});

// Watercolor SVG decorations
var DECOR_SVGS = {
  tealTree: '<svg width="44" height="54" viewBox="0 0 44 54"><ellipse cx="22" cy="20" rx="18" ry="16" fill="#5BB8BE" opacity="0.8"/><ellipse cx="16" cy="14" rx="9" ry="8" fill="#7DD4D8" opacity="0.6"/><ellipse cx="28" cy="24" rx="8" ry="7" fill="#3D9BA2" opacity="0.5"/><rect x="19" y="34" width="5" height="12" rx="2" fill="#8B7B65" opacity="0.7"/></svg>',
  amberTree: '<svg width="42" height="52" viewBox="0 0 42 52"><ellipse cx="21" cy="19" rx="17" ry="15" fill="#E0A050" opacity="0.8"/><ellipse cx="15" cy="13" rx="8" ry="7" fill="#F0C878" opacity="0.6"/><ellipse cx="27" cy="23" rx="7" ry="6" fill="#C07830" opacity="0.5"/><rect x="18" y="32" width="5" height="12" rx="2" fill="#8B7B65" opacity="0.7"/></svg>',
  sageTree: '<svg width="40" height="50" viewBox="0 0 40 50"><ellipse cx="20" cy="18" rx="16" ry="14" fill="#6DAE62" opacity="0.8"/><ellipse cx="14" cy="12" rx="8" ry="6" fill="#90C888" opacity="0.55"/><ellipse cx="26" cy="22" rx="7" ry="6" fill="#4A8A40" opacity="0.5"/><rect x="17" y="30" width="5" height="12" rx="2" fill="#8B7B65" opacity="0.7"/></svg>',
  pine: '<svg width="28" height="58" viewBox="0 0 28 58"><path d="M14 4 L5 20 L9 20 L2 34 L8 34 L1 48 L27 48 L20 34 L26 34 L19 20 L23 20 Z" fill="#4A8A3E" opacity="0.8"/><path d="M14 4 L9 16 L14 16 L7 28 L14 28 Z" fill="#6AAE5A" opacity="0.35"/><rect x="11" y="46" width="5" height="8" rx="1" fill="#8B7B65" opacity="0.7"/></svg>',
  bareBranch: '<svg width="34" height="48" viewBox="0 0 34 48"><path d="M17 46 L17 20 M17 20 L7 6 M17 20 L27 9 M17 26 L5 21 M17 26 L29 19 M17 34 L9 30 M17 34 L25 29" stroke="#6B5D4D" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/></svg>',
  pagoda: '<svg width="56" height="68" viewBox="0 0 56 68"><path d="M12 26 Q28 16 44 26 L42 28 L14 28 Z" fill="#C8453A" opacity="0.85" stroke="#6B2218" stroke-width="0.8"/><rect x="18" y="28" width="20" height="10" fill="#E8D4B8" opacity="0.8" stroke="#8B7B65" stroke-width="0.6"/><path d="M8 42 Q28 32 48 42 L46 44 L10 44 Z" fill="#B83828" opacity="0.85" stroke="#6B2218" stroke-width="0.8"/><rect x="14" y="44" width="28" height="14" fill="#E8D4B8" opacity="0.8" stroke="#8B7B65" stroke-width="0.6"/><rect x="22" y="48" width="10" height="10" fill="#3D2010" opacity="0.6"/></svg>',
  gate: '<svg width="58" height="48" viewBox="0 0 58 48"><path d="M2 16 Q29 5 56 16 L54 18 L4 18 Z" fill="#C8453A" opacity="0.8" stroke="#6B2218" stroke-width="0.6"/><rect x="4" y="18" width="50" height="4" fill="#D4A040" opacity="0.75"/><rect x="9" y="22" width="6" height="20" fill="#6B5D4D" opacity="0.7"/><rect x="43" y="22" width="6" height="20" fill="#6B5D4D" opacity="0.7"/><rect x="18" y="25" width="22" height="17" fill="#F0E4D0" opacity="0.7" stroke="#8B7B65" stroke-width="0.6"/></svg>',
  cloud: '<svg width="64" height="28" viewBox="0 0 64 28"><ellipse cx="14" cy="16" rx="12" ry="8" fill="#FFFFFF" opacity="0.8"/><ellipse cx="32" cy="12" rx="16" ry="10" fill="#FFFFFF" opacity="0.85"/><ellipse cx="50" cy="16" rx="12" ry="8" fill="#FFFFFF" opacity="0.75"/></svg>',
  birds: '<svg width="40" height="16" viewBox="0 0 40 16"><path d="M2 8 Q6 3 10 8 Q14 3 18 8" stroke="#5A5048" stroke-width="1.8" fill="none" stroke-linecap="round" opacity="0.7"/><path d="M22 5 Q26 1 30 5" stroke="#5A5048" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.65"/><path d="M32 10 Q36 6 40 10" stroke="#5A5048" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.6"/></svg>',
  mountain: '<svg width="60" height="44" viewBox="0 0 60 44"><path d="M2 42 L20 12 L30 24 L40 6 L58 42 Z" fill="#8A9CAA" opacity="0.6"/><path d="M17 16 L20 12 L23 16 L20 14 Z" fill="#FFFFFF" opacity="0.8"/><path d="M37 10 L40 6 L43 10 L40 8 Z" fill="#FFFFFF" opacity="0.8"/></svg>',
  bamboo: '<svg width="28" height="54" viewBox="0 0 28 54"><line x1="8" y1="50" x2="8" y2="6" stroke="#5A9838" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/><line x1="14" y1="50" x2="14" y2="10" stroke="#3D7A22" stroke-width="3.5" stroke-linecap="round" opacity="0.65"/><line x1="20" y1="50" x2="20" y2="8" stroke="#5A9838" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/><line x1="5" y1="12" x2="11" y2="12" stroke="#2D5A14" stroke-width="1" opacity="0.6"/><line x1="11" y1="20" x2="17" y2="20" stroke="#2D5A14" stroke-width="1" opacity="0.6"/><line x1="17" y1="14" x2="23" y2="14" stroke="#2D5A14" stroke-width="1" opacity="0.6"/></svg>',
  bush: '<svg width="28" height="22" viewBox="0 0 28 22"><ellipse cx="14" cy="12" rx="12" ry="8" fill="#6DAE62" opacity="0.65"/><ellipse cx="10" cy="9" rx="5" ry="4" fill="#90C888" opacity="0.45"/></svg>',
  flowers: '<svg width="28" height="26" viewBox="0 0 28 26"><circle cx="8" cy="10" r="5" fill="#E87098" opacity="0.7"/><circle cx="19" cy="8" r="4.5" fill="#F0B840" opacity="0.7"/><circle cx="14" cy="18" r="4.5" fill="#D05878" opacity="0.65"/><circle cx="8" cy="10" r="2" fill="#FFF0D0" opacity="0.7"/><circle cx="19" cy="8" r="2" fill="#FFF0D0" opacity="0.7"/></svg>',
  lantern: '<svg width="22" height="40" viewBox="0 0 22 40"><rect x="6" y="30" width="10" height="5" fill="#8B8070" opacity="0.7"/><rect x="5" y="25" width="12" height="6" fill="#9B9080" opacity="0.7"/><rect x="6" y="16" width="10" height="10" fill="#C8BCA8" opacity="0.7"/><circle cx="11" cy="21" r="2.5" fill="#F0C840" opacity="0.75"/><path d="M4 15 L18 15 L15 12 L7 12 Z" fill="#8B8070" opacity="0.7"/></svg>'
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

  var gridSize=11, cellStep=0.003;
  var startLat = userLat - (gridSize*cellStep)/2;
  var startLng = userLng - (gridSize*cellStep*1.3)/2;

  for(var gx=0; gx<gridSize; gx++){
    for(var gy=0; gy<gridSize; gy++){
      var cellCenterLat = startLat + gy*cellStep;
      var cellCenterLng = startLng + gx*cellStep*1.3;
      var dcx = gx - gridSize/2, dcy = gy - gridSize/2;
      var cellDist = Math.sqrt(dcx*dcx + dcy*dcy);
      if(cellDist < 0.8) continue;
      var decorPerCell = cellDist > 4.5 ? 1 : (rand() > 0.25 ? 2 : 1);
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
        var scale = 1.1 + rand()*0.8;
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
