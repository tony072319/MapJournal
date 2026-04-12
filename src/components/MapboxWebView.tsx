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
      if (data.type === 'markerPress' && onMarkerPress) onMarkerPress(data.id);
    } catch {}
  }, [onMarkerPress]);
  React.useEffect(() => {
    webViewRef.current?.injectJavaScript(`if(window.updateMarkers) window.updateMarkers(${markersJSON});true;`);
  }, [markersJSON]);
  React.useEffect(() => {
    webViewRef.current?.injectJavaScript(`if(window.updateUserLocation) window.updateUserLocation(${location.latitude}, ${location.longitude});true;`);
  }, [location.latitude, location.longitude]);
  const html = useMemo(() => generateHTML(location, markers), []);
  return (
    <View style={[styles.container, { height }]}>
      <WebView ref={webViewRef} source={{ html }} style={styles.webview} onMessage={handleMessage}
        scrollEnabled={false} bounces={false} overScrollMode="never"
        showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
        javaScriptEnabled domStorageEnabled originWhitelist={['*']}
        mixedContentMode="always" allowsInlineMediaPlayback />
    </View>
  );
};

function generateHTML(location: UserLocation, initialMarkers: MarkerData[]): string {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#F4EDE4}
#map{width:100%;height:100%}
.mapboxgl-ctrl-logo,.mapboxgl-ctrl-attrib{display:none!important}
#paper-texture{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:2;background-repeat:repeat}
#vignette{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:3;box-shadow:inset 0 0 120px rgba(80,60,40,0.1)}
.marker-container{cursor:pointer;position:relative}
.marker-bubble{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:23px;background:#FFFFFF;border:2px solid rgba(124,108,240,0.25);box-shadow:0 3px 12px rgba(100,80,60,0.12);position:relative;transition:transform 0.15s}
.marker-bubble:active{transform:scale(0.92)}
.marker-inner{width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;font-size:20px}
.marker-badge{position:absolute;top:-5px;right:-5px;background:linear-gradient(135deg,#FF7EB3,#FF5A8A);color:white;font-size:10px;font-weight:800;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px;border:2px solid #FFF}
.user-dot-wrapper{position:relative;width:22px;height:22px}
.user-dot-pulse{position:absolute;top:-7px;left:-7px;width:36px;height:36px;border-radius:50%;background:rgba(124,108,240,0.12);animation:pulse 2s ease-out infinite}
.user-dot{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#7C6CF0;border:3px solid #FFFFFF;box-shadow:0 2px 8px rgba(124,108,240,0.35)}
@keyframes pulse{0%{transform:scale(0.8);opacity:1}100%{transform:scale(2.2);opacity:0}}
.controls{position:absolute;right:14px;top:100px;display:flex;flex-direction:column;gap:6px;z-index:20}
.ctrl-btn{width:36px;height:36px;border-radius:18px;background:rgba(255,255,255,0.88);border:1px solid rgba(180,170,155,0.3);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:300;color:#6B6058;box-shadow:0 2px 8px rgba(80,60,40,0.08);cursor:pointer;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.ctrl-btn:active{background:rgba(255,255,255,1);transform:scale(0.92)}
.loc-icon{width:14px;height:14px;border-radius:7px;border:2px solid #7C6CF0;display:flex;align-items:center;justify-content:center}
.loc-dot{width:4px;height:4px;border-radius:50%;background:#7C6CF0}
.attr{position:absolute;bottom:4px;left:8px;font-size:8px;color:rgba(107,96,88,0.2);font-family:-apple-system,sans-serif;z-index:20}
</style></head><body>
<div id="map"></div>
<div id="paper-texture"></div>
<div id="vignette"></div>
<div class="controls">
  <button class="ctrl-btn" onclick="zoomIn()">+</button>
  <button class="ctrl-btn" onclick="zoomOut()">\u2212</button>
  <div style="height:6px"></div>
  <button class="ctrl-btn" onclick="recenter()"><div class="loc-icon"><div class="loc-dot"></div></div></button>
</div>
<div class="attr">\u00a9 Mapbox \u00a9 OpenStreetMap</div>
<script>
mapboxgl.accessToken = '${MAPBOX_TOKEN}';
var userLat = ${location.latitude}, userLng = ${location.longitude};
var markerElements = [];
var map = new mapboxgl.Map({
  container:'map', center:[userLng,userLat], zoom:15.5,
  style:{
    version:8,
    sources:{composite:{url:'mapbox://mapbox.mapbox-streets-v8',type:'vector'}},
    glyphs:'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    layers:[
      {id:'bg',type:'background',paint:{'background-color':'#F4EDE4'}},
      {id:'landuse-green',type:'fill',source:'composite','source-layer':'landuse',
        filter:['in','class','park','pitch','grass','cemetery','scrub'],
        paint:{'fill-color':'#C8DCBA','fill-opacity':0.55}},
      {id:'water',type:'fill',source:'composite','source-layer':'water',
        paint:{'fill-color':'#A8C8D8'}},
      {id:'waterway',type:'line',source:'composite','source-layer':'waterway',
        paint:{'line-color':'#90B8CA','line-width':['interpolate',['linear'],['zoom'],8,0.5,14,1.5,18,3]}},
      {id:'building',type:'fill',source:'composite','source-layer':'building',minzoom:14,
        paint:{'fill-color':'#E8E2D8','fill-opacity':['interpolate',['linear'],['zoom'],14,0,15,0.4],'fill-outline-color':'#D8D0C4'}},
      {id:'rc-hw',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','motorway','trunk','motorway_link','trunk_link'],minzoom:5,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#CCC4B0','line-width':['interpolate',['exponential',1.5],['zoom'],5,0.5,12,3,18,22]}},
      {id:'rc-pr',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','primary','primary_link'],minzoom:7,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#D5CFC0','line-width':['interpolate',['exponential',1.5],['zoom'],7,0.5,12,2,18,18]}},
      {id:'rc-sc',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','secondary','secondary_link','tertiary','tertiary_link'],minzoom:9,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#DDD5C5','line-width':['interpolate',['exponential',1.5],['zoom'],9,0.3,12,1.5,18,14]}},
      {id:'rc-mn',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','street','street_limited','service'],minzoom:12,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#DDD5C5','line-width':['interpolate',['exponential',1.5],['zoom'],12,0.3,18,10]}},
      {id:'rf-hw',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','motorway','trunk','motorway_link','trunk_link'],minzoom:5,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#FFFFFF','line-width':['interpolate',['exponential',1.5],['zoom'],5,0.2,12,2,18,18]}},
      {id:'rf-pr',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','primary','primary_link'],minzoom:7,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#FFFFFF','line-width':['interpolate',['exponential',1.5],['zoom'],7,0.2,12,1.2,18,14]}},
      {id:'rf-sc',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','secondary','secondary_link','tertiary','tertiary_link'],minzoom:9,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#FFFFFF','line-width':['interpolate',['exponential',1.5],['zoom'],9,0.1,12,0.8,18,10]}},
      {id:'rf-mn',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','street','street_limited','service'],minzoom:12,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#FAF6EE','line-width':['interpolate',['exponential',1.5],['zoom'],12,0.1,18,7]}},
      {id:'rd-path',type:'line',source:'composite','source-layer':'road',
        filter:['in','class','path','pedestrian','track'],minzoom:14,
        layout:{'line-cap':'round','line-join':'round'},
        paint:{'line-color':'#CCC4B4','line-width':1,'line-dasharray':[2,2]}},
      {id:'admin',type:'line',source:'composite','source-layer':'admin',
        filter:['>=','admin_level',2],
        paint:{'line-color':'#C8C0B0','line-width':0.8,'line-dasharray':[3,2]}},
      {id:'place-label',type:'symbol',source:'composite','source-layer':'place_label',minzoom:4,
        layout:{'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],'text-font':['DIN Pro Medium','Arial Unicode MS Regular'],'text-size':['interpolate',['linear'],['zoom'],4,10,12,16,16,18],'text-max-width':8,'text-letter-spacing':0.05},
        paint:{'text-color':'#6B6058','text-halo-color':'#F4EDE4','text-halo-width':1.5,'text-halo-blur':0.5}},
      {id:'road-label',type:'symbol',source:'composite','source-layer':'road',minzoom:12,
        layout:{'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],'text-font':['DIN Pro Regular','Arial Unicode MS Regular'],'text-size':['interpolate',['linear'],['zoom'],12,9,16,12],'symbol-placement':'line','text-max-angle':30,'text-rotation-alignment':'map','text-pitch-alignment':'viewport'},
        paint:{'text-color':'#8A8278','text-halo-color':'#F4EDE4','text-halo-width':1,'text-halo-blur':0.3}},
      {id:'poi-label',type:'symbol',source:'composite','source-layer':'poi_label',minzoom:15,
        layout:{'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],'text-font':['DIN Pro Regular','Arial Unicode MS Regular'],'text-size':10,'text-max-width':6},
        paint:{'text-color':'#9B9488','text-halo-color':'#F4EDE4','text-halo-width':1,'text-halo-blur':0.3}}
    ]
  },
  attributionControl:false, pitch:0, bearing:0
});

map.on('load', function() {
  document.querySelectorAll('.mapboxgl-ctrl-logo').forEach(function(el){el.style.display='none';});
  var tc=document.createElement('canvas');tc.width=128;tc.height=128;
  var cx=tc.getContext('2d');var id=cx.createImageData(128,128);
  for(var i=0;i<id.data.length;i+=4){var v=Math.floor(Math.random()*255);id.data[i]=v;id.data[i+1]=v;id.data[i+2]=v;id.data[i+3]=15;}
  cx.putImageData(id,0,0);
  document.getElementById('paper-texture').style.backgroundImage='url('+tc.toDataURL()+')';
  addIcons();
  addDecorations();
  addUserMarker();
  if(window.pendingMarkers){updateMarkers(window.pendingMarkers);window.pendingMarkers=null;}
});

function mkI(w,h,fn){var c=document.createElement('canvas');c.width=w;c.height=h;var t=c.getContext('2d');fn(t);return t.getImageData(0,0,w,h);}
function drawTree(t,cx,cy,r,c1,c2,c3){
  t.globalAlpha=0.85;t.fillStyle=c1;t.beginPath();t.ellipse(cx,cy,r,r*0.85,0,0,6.28);t.fill();
  t.globalAlpha=0.5;t.fillStyle=c2;t.beginPath();t.ellipse(cx-r*0.25,cy-r*0.3,r*0.5,r*0.42,0,0,6.28);t.fill();
  t.globalAlpha=0.4;t.fillStyle=c3;t.beginPath();t.ellipse(cx+r*0.25,cy+r*0.2,r*0.4,r*0.35,0,0,6.28);t.fill();
  t.globalAlpha=1;
}

function addIcons(){
  map.addImage('t1',mkI(100,120,function(t){t.fillStyle='#8B7B65';t.globalAlpha=0.7;t.fillRect(45,85,10,30);drawTree(t,50,48,38,'#5BB8BE','#85DDE2','#3A9EA5');}),{pixelRatio:2});
  map.addImage('t2',mkI(100,120,function(t){t.fillStyle='#8B7B65';t.globalAlpha=0.7;t.fillRect(45,85,10,30);drawTree(t,50,48,36,'#E0A050','#F0C878','#C07830');}),{pixelRatio:2});
  map.addImage('t3',mkI(100,120,function(t){t.fillStyle='#8B7B65';t.globalAlpha=0.7;t.fillRect(45,85,10,30);drawTree(t,50,48,36,'#6DAE62','#95CC8A','#4A8A3E');}),{pixelRatio:2});
  map.addImage('p1',mkI(60,120,function(t){
    t.fillStyle='#8B7B65';t.globalAlpha=0.7;t.fillRect(26,95,8,20);
    t.globalAlpha=0.8;t.fillStyle='#4A8A3E';
    t.beginPath();t.moveTo(30,10);t.lineTo(8,45);t.lineTo(52,45);t.closePath();t.fill();
    t.beginPath();t.moveTo(30,30);t.lineTo(4,70);t.lineTo(56,70);t.closePath();t.fill();
    t.beginPath();t.moveTo(30,50);t.lineTo(0,98);t.lineTo(60,98);t.closePath();t.fill();
    t.globalAlpha=0.3;t.fillStyle='#6AAE5A';
    t.beginPath();t.moveTo(30,10);t.lineTo(16,40);t.lineTo(30,40);t.closePath();t.fill();
  }),{pixelRatio:2});
  map.addImage('b1',mkI(80,110,function(t){
    t.strokeStyle='#5A4A3A';t.lineWidth=3;t.lineCap='round';t.globalAlpha=0.75;
    t.beginPath();t.moveTo(40,105);t.lineTo(40,45);t.stroke();
    t.beginPath();t.moveTo(40,45);t.lineTo(15,10);t.stroke();
    t.beginPath();t.moveTo(40,45);t.lineTo(65,12);t.stroke();
    t.lineWidth=2;
    t.beginPath();t.moveTo(40,60);t.lineTo(12,42);t.stroke();
    t.beginPath();t.moveTo(40,60);t.lineTo(68,40);t.stroke();
    t.beginPath();t.moveTo(40,72);t.lineTo(18,60);t.stroke();
    t.beginPath();t.moveTo(40,72);t.lineTo(62,58);t.stroke();
    t.lineWidth=1.5;
    t.beginPath();t.moveTo(27,28);t.lineTo(10,8);t.stroke();
    t.beginPath();t.moveTo(53,28);t.lineTo(72,6);t.stroke();
  }),{pixelRatio:2});
  map.addImage('pg',mkI(120,160,function(t){
    t.fillStyle='#E8D4B8';t.globalAlpha=0.85;t.fillRect(25,110,70,35);
    t.strokeStyle='#8B7B65';t.lineWidth=1;t.strokeRect(25,110,70,35);
    t.fillStyle='#3D2010';t.globalAlpha=0.6;t.fillRect(50,118,20,27);
    t.fillStyle='#C8453A';t.globalAlpha=0.85;
    t.beginPath();t.moveTo(12,112);t.quadraticCurveTo(60,85,108,112);t.lineTo(100,108);t.lineTo(20,108);t.closePath();t.fill();
    t.fillStyle='#E8D4B8';t.globalAlpha=0.85;t.fillRect(35,68,50,32);
    t.strokeStyle='#8B7B65';t.lineWidth=1;t.strokeRect(35,68,50,32);
    t.fillStyle='#B83828';t.globalAlpha=0.85;
    t.beginPath();t.moveTo(22,70);t.quadraticCurveTo(60,45,98,70);t.lineTo(90,66);t.lineTo(30,66);t.closePath();t.fill();
    t.strokeStyle='#3D2010';t.lineWidth=2.5;t.globalAlpha=0.7;
    t.beginPath();t.moveTo(60,48);t.lineTo(60,22);t.stroke();
    t.fillStyle='#D4A040';t.globalAlpha=0.8;t.beginPath();t.arc(60,20,5,0,6.28);t.fill();
  }),{pixelRatio:2});
  map.addImage('cl',mkI(100,50,function(t){
    t.globalAlpha=0.7;t.fillStyle='#FFFFFF';
    t.beginPath();t.ellipse(20,28,16,12,0,0,6.28);t.fill();
    t.beginPath();t.ellipse(50,20,22,15,0,0,6.28);t.fill();
    t.beginPath();t.ellipse(78,28,16,12,0,0,6.28);t.fill();
  }),{pixelRatio:2});
  map.addImage('br',mkI(70,30,function(t){
    t.strokeStyle='#5A4A3A';t.lineWidth=2;t.lineCap='round';t.globalAlpha=0.7;
    t.beginPath();t.moveTo(5,14);t.quadraticCurveTo(12,6,19,14);t.stroke();
    t.beginPath();t.moveTo(19,14);t.quadraticCurveTo(26,6,33,14);t.stroke();
    t.lineWidth=1.5;
    t.beginPath();t.moveTo(40,10);t.quadraticCurveTo(47,4,54,10);t.stroke();
    t.beginPath();t.moveTo(54,18);t.quadraticCurveTo(61,12,68,18);t.stroke();
  }),{pixelRatio:2});
  map.addImage('bu',mkI(60,44,function(t){
    t.globalAlpha=0.7;t.fillStyle='#6DAE62';t.beginPath();t.ellipse(30,24,25,16,0,0,6.28);t.fill();
    t.globalAlpha=0.45;t.fillStyle='#95CC8A';t.beginPath();t.ellipse(22,18,12,10,0,0,6.28);t.fill();
  }),{pixelRatio:2});
  map.addImage('fl',mkI(50,46,function(t){
    t.globalAlpha=0.7;
    t.fillStyle='#E87098';t.beginPath();t.arc(14,18,8,0,6.28);t.fill();
    t.fillStyle='#F0B840';t.beginPath();t.arc(34,14,7,0,6.28);t.fill();
    t.fillStyle='#D05878';t.beginPath();t.arc(24,32,7,0,6.28);t.fill();
    t.globalAlpha=0.8;t.fillStyle='#FFF0D0';
    t.beginPath();t.arc(14,18,3,0,6.28);t.fill();
    t.beginPath();t.arc(34,14,3,0,6.28);t.fill();
  }),{pixelRatio:2});
}

function addDecorations(){
  var s=Math.floor(userLat*1e4)+Math.floor(userLng*1e4);
  function r(){s=(s*9301+49297)%233280;return s/233280;}
  var tp=['t1','t1','t1','t1','t1','t2','t2','t2','t3','t3','t3','p1','p1','b1','b1','bu','bu','fl','pg','cl','br'];
  var ft=[],gs=18,cs=0.002;
  var sla=userLat-(gs*cs)/2,sln=userLng-(gs*cs*1.3)/2;
  for(var x=0;x<gs;x++)for(var y=0;y<gs;y++){
    var la=sla+y*cs,ln=sln+x*cs*1.3;
    var dx=x-gs/2,dy=y-gs/2,d=Math.sqrt(dx*dx+dy*dy);
    if(d<0.5)continue;
    var nc=d>7?1:(r()>0.25?2:1);
    for(var i=0;i<nc;i++){
      ft.push({type:'Feature',geometry:{type:'Point',coordinates:[ln+(r()-0.5)*cs*1.2,la+(r()-0.5)*cs*0.9]},properties:{icon:tp[Math.floor(r()*tp.length)],sz:0.7+r()*0.6}});
    }
  }
  map.addSource('deco',{type:'geojson',data:{type:'FeatureCollection',features:ft}});
  map.addLayer({id:'deco',type:'symbol',source:'deco',
    layout:{'icon-image':['get','icon'],
      'icon-size':['*',['get','sz'],['interpolate',['linear'],['zoom'],13,0.3,15,0.9,16,1.4,18,2.8]],
      'icon-allow-overlap':true,'icon-ignore-placement':true,'icon-anchor':'bottom','icon-padding':0}
  },'water');
}

var userMarker=null;
function addUserMarker(){
  var w=document.createElement('div');w.className='user-dot-wrapper';
  w.innerHTML='<div class="user-dot-pulse"></div><div class="user-dot"></div>';
  userMarker=new mapboxgl.Marker({element:w}).setLngLat([userLng,userLat]).addTo(map);
}
function createMarkerEl(m){
  var c=document.createElement('div');c.className='marker-container';
  var b=document.createElement('div');b.className='marker-bubble';b.style.borderColor=m.moodColor+'50';
  var inner=document.createElement('div');inner.className='marker-inner';inner.style.backgroundColor=m.moodColor+'18';inner.textContent=m.emoji;
  b.appendChild(inner);
  if(m.count&&m.count>1){var badge=document.createElement('div');badge.className='marker-badge';badge.textContent=m.count;b.appendChild(badge);}
  c.appendChild(b);
  c.addEventListener('click',function(e){e.stopPropagation();window.ReactNativeWebView.postMessage(JSON.stringify({type:'markerPress',id:m.id}));});
  return c;
}
function updateMarkers(nm){
  if(!map.isStyleLoaded()){window.pendingMarkers=nm;return;}
  markerElements.forEach(function(m){m.remove();});markerElements=[];
  nm.forEach(function(m){var el=createMarkerEl(m);var marker=new mapboxgl.Marker({element:el,anchor:'center'}).setLngLat([m.longitude,m.latitude]).addTo(map);markerElements.push(marker);});
}
function updateUserLocation(lat,lng){userLat=lat;userLng=lng;if(userMarker)userMarker.setLngLat([lng,lat]);}
function zoomIn(){map.zoomTo(map.getZoom()+1,{duration:300});}
function zoomOut(){map.zoomTo(map.getZoom()-1,{duration:300});}
function recenter(){map.flyTo({center:[userLng,userLat],zoom:15.5,pitch:0,bearing:0,duration:600});}
window.updateMarkers=updateMarkers;
window.updateUserLocation=updateUserLocation;
updateMarkers(${JSON.stringify(initialMarkers)});
</script></body></html>`;
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: '#F4EDE4' },
});
