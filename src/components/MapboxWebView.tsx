import React, { useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { MAPBOX_TOKEN } from '../constants/mapbox';
import { UserLocation } from '../types';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
interface MarkerData { latitude: number; longitude: number; emoji: string; id: string; moodColor: string; count?: number; }
interface Props { location: UserLocation; markers?: MarkerData[]; onMarkerPress?: (id: string) => void; height?: number; }
export const MapboxWebView: React.FC<Props> = ({ location, markers = [], onMarkerPress, height = SCREEN_HEIGHT }) => {
  const webViewRef = useRef<WebView>(null);
  const markersJSON = useMemo(() => JSON.stringify(markers), [markers]);
  const handleMessage = useCallback((event: any) => { try { const data = JSON.parse(event.nativeEvent.data); if (data.type === 'markerPress' && onMarkerPress) onMarkerPress(data.id); } catch {} }, [onMarkerPress]);
  React.useEffect(() => { webViewRef.current?.injectJavaScript(`if(window.updateMarkers) window.updateMarkers(${markersJSON});true;`); }, [markersJSON]);
  React.useEffect(() => { webViewRef.current?.injectJavaScript(`if(window.updateUserLocation) window.updateUserLocation(${location.latitude}, ${location.longitude});true;`); }, [location.latitude, location.longitude]);
  const html = useMemo(() => generateHTML(location, markers), []);
  return (<View style={[styles.container, { height }]}><WebView ref={webViewRef} source={{ html }} style={styles.webview} onMessage={handleMessage} scrollEnabled={false} bounces={false} overScrollMode="never" showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} javaScriptEnabled domStorageEnabled originWhitelist={['*']} mixedContentMode="always" allowsInlineMediaPlayback /></View>);
};
function generateHTML(location: UserLocation, initialMarkers: MarkerData[]): string {
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script src="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.js"></script>
<link href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css" rel="stylesheet" />
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#F4EDE4}
#deco{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0}
#map{position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;background:transparent!important}
.mapboxgl-map,.mapboxgl-canvas-container,.mapboxgl-canvas{background:transparent!important}
.mapboxgl-ctrl-logo,.mapboxgl-ctrl-attrib{display:none!important}
#paper-texture{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:4;background-repeat:repeat}
#vignette{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:5;box-shadow:inset 0 0 120px rgba(80,60,40,0.1)}
.marker-container{cursor:pointer;position:relative}
.marker-bubble{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:23px;background:#FFF;border:2px solid rgba(124,108,240,0.25);box-shadow:0 3px 12px rgba(100,80,60,0.12);position:relative;transition:transform .15s}
.marker-bubble:active{transform:scale(.92)}
.marker-inner{width:38px;height:38px;border-radius:19px;display:flex;align-items:center;justify-content:center;font-size:20px}
.marker-badge{position:absolute;top:-5px;right:-5px;background:linear-gradient(135deg,#FF7EB3,#FF5A8A);color:#fff;font-size:10px;font-weight:800;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px;border:2px solid #FFF}
.user-dot-wrapper{position:relative;width:22px;height:22px}
.user-dot-pulse{position:absolute;top:-7px;left:-7px;width:36px;height:36px;border-radius:50%;background:rgba(124,108,240,.12);animation:pulse 2s ease-out infinite}
.user-dot{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#7C6CF0;border:3px solid #FFF;box-shadow:0 2px 8px rgba(124,108,240,.35)}
@keyframes pulse{0%{transform:scale(.8);opacity:1}100%{transform:scale(2.2);opacity:0}}
.controls{position:absolute;right:14px;top:100px;display:flex;flex-direction:column;gap:6px;z-index:20}
.ctrl-btn{width:36px;height:36px;border-radius:18px;background:rgba(255,255,255,.88);border:1px solid rgba(180,170,155,.3);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:300;color:#6B6058;box-shadow:0 2px 8px rgba(80,60,40,.08);cursor:pointer;-webkit-tap-highlight-color:transparent;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.ctrl-btn:active{background:rgba(255,255,255,1);transform:scale(.92)}
.loc-icon{width:14px;height:14px;border-radius:7px;border:2px solid #7C6CF0;display:flex;align-items:center;justify-content:center}
.loc-dot{width:4px;height:4px;border-radius:50%;background:#7C6CF0}
.attr{position:absolute;bottom:4px;left:8px;font-size:8px;color:rgba(107,96,88,.2);font-family:-apple-system,sans-serif;z-index:20}
</style></head><body>
<canvas id="deco"></canvas>
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
mapboxgl.accessToken='${MAPBOX_TOKEN}';
var userLat=${location.latitude},userLng=${location.longitude},markerElements=[];
var map=new mapboxgl.Map({
  container:'map',center:[userLng,userLat],zoom:15.5,
  style:{version:8,
    sources:{composite:{url:'mapbox://mapbox.mapbox-streets-v8',type:'vector'}},
    glyphs:'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    layers:[
      {id:'bg',type:'background',paint:{'background-color':'rgba(0,0,0,0)'}},
      {id:'landuse-green',type:'fill',source:'composite','source-layer':'landuse',filter:['in','class','park','pitch','grass','cemetery','scrub'],paint:{'fill-color':'#C0D8B0','fill-opacity':0.5}},
      {id:'water',type:'fill',source:'composite','source-layer':'water',paint:{'fill-color':'#A0C4D4'}},
      {id:'waterway',type:'line',source:'composite','source-layer':'waterway',paint:{'line-color':'#90B8CA','line-width':['interpolate',['linear'],['zoom'],8,0.5,14,1.5,18,3]}},
      {id:'building',type:'fill',source:'composite','source-layer':'building',minzoom:14,paint:{'fill-color':'#E6E0D6','fill-opacity':['interpolate',['linear'],['zoom'],14,0,15,0.4],'fill-outline-color':'#D6CEC2'}},
      {id:'rc-hw',type:'line',source:'composite','source-layer':'road',filter:['in','class','motorway','trunk','motorway_link','trunk_link'],minzoom:5,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#CCC4B0','line-width':['interpolate',['exponential',1.5],['zoom'],5,.5,12,3,18,22]}},
      {id:'rc-pr',type:'line',source:'composite','source-layer':'road',filter:['in','class','primary','primary_link'],minzoom:7,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#D5CFC0','line-width':['interpolate',['exponential',1.5],['zoom'],7,.5,12,2,18,18]}},
      {id:'rc-sc',type:'line',source:'composite','source-layer':'road',filter:['in','class','secondary','secondary_link','tertiary','tertiary_link'],minzoom:9,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#DDD5C5','line-width':['interpolate',['exponential',1.5],['zoom'],9,.3,12,1.5,18,14]}},
      {id:'rc-mn',type:'line',source:'composite','source-layer':'road',filter:['in','class','street','street_limited','service'],minzoom:12,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#DDD5C5','line-width':['interpolate',['exponential',1.5],['zoom'],12,.3,18,10]}},
      {id:'rf-hw',type:'line',source:'composite','source-layer':'road',filter:['in','class','motorway','trunk','motorway_link','trunk_link'],minzoom:5,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#FFFFFF','line-width':['interpolate',['exponential',1.5],['zoom'],5,.2,12,2,18,18]}},
      {id:'rf-pr',type:'line',source:'composite','source-layer':'road',filter:['in','class','primary','primary_link'],minzoom:7,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#FFFFFF','line-width':['interpolate',['exponential',1.5],['zoom'],7,.2,12,1.2,18,14]}},
      {id:'rf-sc',type:'line',source:'composite','source-layer':'road',filter:['in','class','secondary','secondary_link','tertiary','tertiary_link'],minzoom:9,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#FFFFFF','line-width':['interpolate',['exponential',1.5],['zoom'],9,.1,12,.8,18,10]}},
      {id:'rf-mn',type:'line',source:'composite','source-layer':'road',filter:['in','class','street','street_limited','service'],minzoom:12,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#FAF6EE','line-width':['interpolate',['exponential',1.5],['zoom'],12,.1,18,7]}},
      {id:'rd-path',type:'line',source:'composite','source-layer':'road',filter:['in','class','path','pedestrian','track'],minzoom:14,layout:{'line-cap':'round','line-join':'round'},paint:{'line-color':'#CCC4B4','line-width':1,'line-dasharray':[2,2]}},
      {id:'admin',type:'line',source:'composite','source-layer':'admin',filter:['>=','admin_level',2],paint:{'line-color':'#C8C0B0','line-width':.8,'line-dasharray':[3,2]}},
      {id:'place-label',type:'symbol',source:'composite','source-layer':'place_label',minzoom:4,layout:{'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],'text-font':['DIN Pro Medium','Arial Unicode MS Regular'],'text-size':['interpolate',['linear'],['zoom'],4,10,12,16,16,18],'text-max-width':8,'text-letter-spacing':.05},paint:{'text-color':'#6B6058','text-halo-color':'#F4EDE4','text-halo-width':1.5,'text-halo-blur':.5}},
      {id:'road-label',type:'symbol',source:'composite','source-layer':'road',minzoom:12,layout:{'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],'text-font':['DIN Pro Regular','Arial Unicode MS Regular'],'text-size':['interpolate',['linear'],['zoom'],12,9,16,12],'symbol-placement':'line','text-max-angle':30,'text-rotation-alignment':'map','text-pitch-alignment':'viewport'},paint:{'text-color':'#8A8278','text-halo-color':'#F4EDE4','text-halo-width':1,'text-halo-blur':.3}},
      {id:'poi-label',type:'symbol',source:'composite','source-layer':'poi_label',minzoom:15,layout:{'text-field':['coalesce',['get','name_zh-Hans'],['get','name']],'text-font':['DIN Pro Regular','Arial Unicode MS Regular'],'text-size':10,'text-max-width':6},paint:{'text-color':'#9B9488','text-halo-color':'#F4EDE4','text-halo-width':1,'text-halo-blur':.3}}
    ]},
  attributionControl:false,pitch:0,bearing:0
});

// ---- Canvas decoration system ----
var dc,dx,decos=[];
function initCanvas(){
  dc=document.getElementById('deco');
  var dpr=window.devicePixelRatio||1;
  dc.width=dc.offsetWidth*dpr;dc.height=dc.offsetHeight*dpr;
  dx=dc.getContext('2d');dx.scale(dpr,dpr);
}
function genDecos(){
  var s=Math.floor(userLat*1e4)+Math.floor(userLng*1e4);
  function r(){s=(s*9301+49297)%233280;return s/233280;}
  var tp=['teal','teal','teal','teal','amber','amber','amber','sage','sage','sage','pine','pine','bare','bare','bush','bush','bush'];
  var gs=20,cs=0.0018;
  var sla=userLat-(gs*cs)/2,sln=userLng-(gs*cs*1.3)/2;
  for(var x=0;x<gs;x++)for(var y=0;y<gs;y++){
    var la=sla+y*cs,ln=sln+x*cs*1.3;
    var ddx=x-gs/2,ddy=y-gs/2,d=Math.sqrt(ddx*ddx+ddy*ddy);
    if(d<0.5)continue;
    var nc=d>8?1:(r()>.2?2:1);
    for(var i=0;i<nc;i++){
      decos.push({lat:la+(r()-.5)*cs*.9,lng:ln+(r()-.5)*cs*.9*1.3,
        type:tp[Math.floor(r()*tp.length)],sz:.8+r()*.5,rot:(r()-.5)*.2});
    }
  }
}
function drawRT(c,s,c1,c2,c3){
  c.fillStyle='#8B7B65';c.globalAlpha=.65;c.fillRect(-s*.06,-s*.05,s*.12,s*.35);
  c.globalAlpha=.8;c.fillStyle=c1;c.beginPath();c.ellipse(0,-s*.5,s*.7,s*.6,0,0,6.28);c.fill();
  c.globalAlpha=.45;c.fillStyle=c2;c.beginPath();c.ellipse(-s*.2,-s*.7,s*.3,s*.25,0,0,6.28);c.fill();
  c.globalAlpha=.35;c.fillStyle=c3;c.beginPath();c.ellipse(s*.2,-s*.3,s*.28,s*.22,0,0,6.28);c.fill();
  c.globalAlpha=1;
}
function drawPN(c,s){
  c.fillStyle='#8B7B65';c.globalAlpha=.65;c.fillRect(-s*.06,-s*.05,s*.12,s*.3);
  c.globalAlpha=.8;c.fillStyle='#4A8A3E';
  c.beginPath();c.moveTo(0,-s*1.1);c.lineTo(-s*.35,-s*.55);c.lineTo(s*.35,-s*.55);c.closePath();c.fill();
  c.beginPath();c.moveTo(0,-s*.75);c.lineTo(-s*.45,-s*.15);c.lineTo(s*.45,-s*.15);c.closePath();c.fill();
  c.globalAlpha=.3;c.fillStyle='#6AAE5A';
  c.beginPath();c.moveTo(0,-s*1.1);c.lineTo(-s*.15,-s*.6);c.lineTo(0,-s*.6);c.closePath();c.fill();
  c.globalAlpha=1;
}
function drawBR(c,s){
  c.strokeStyle='#5A4A3A';c.lineWidth=Math.max(1,s*.06);c.lineCap='round';c.globalAlpha=.7;
  c.beginPath();c.moveTo(0,s*.2);c.lineTo(0,-s*.4);c.stroke();
  c.beginPath();c.moveTo(0,-s*.4);c.lineTo(-s*.35,-s*.9);c.stroke();
  c.beginPath();c.moveTo(0,-s*.4);c.lineTo(s*.35,-s*.85);c.stroke();
  c.lineWidth=Math.max(.8,s*.04);
  c.beginPath();c.moveTo(0,-s*.2);c.lineTo(-s*.35,-s*.5);c.stroke();
  c.beginPath();c.moveTo(0,-s*.2);c.lineTo(s*.35,-s*.45);c.stroke();
  c.globalAlpha=1;
}
function drawBU(c,s){
  c.globalAlpha=.65;c.fillStyle='#6DAE62';c.beginPath();c.ellipse(0,-s*.15,s*.5,s*.35,0,0,6.28);c.fill();
  c.globalAlpha=.4;c.fillStyle='#95CC8A';c.beginPath();c.ellipse(-s*.12,-s*.25,s*.25,s*.18,0,0,6.28);c.fill();
  c.globalAlpha=1;
}
function renderDeco(){
  if(!dx)return;
  var w=dc.offsetWidth,h=dc.offsetHeight;
  dx.clearRect(0,0,w,h);
  dx.fillStyle='#F4EDE4';dx.fillRect(0,0,w,h);
  var zoom=map.getZoom();
  var bs=Math.pow(2,zoom-13)*8;
  for(var i=0;i<decos.length;i++){
    var d=decos[i];
    var pt=map.project([d.lng,d.lat]);
    if(pt.x<-80||pt.x>w+80||pt.y<-80||pt.y>h+80)continue;
    var s=bs*d.sz;
    dx.save();dx.translate(pt.x,pt.y);dx.rotate(d.rot);
    if(d.type==='teal')drawRT(dx,s,'#5BB8BE','#85DDE2','#3A9EA5');
    else if(d.type==='amber')drawRT(dx,s,'#E0A050','#F0C878','#C07830');
    else if(d.type==='sage')drawRT(dx,s,'#6DAE62','#95CC8A','#4A8A3E');
    else if(d.type==='pine')drawPN(dx,s);
    else if(d.type==='bare')drawBR(dx,s);
    else if(d.type==='bush')drawBU(dx,s);
    dx.restore();
  }
}

map.on('load',function(){
  document.querySelectorAll('.mapboxgl-ctrl-logo').forEach(function(el){el.style.display='none';});
  var tc=document.createElement('canvas');tc.width=128;tc.height=128;
  var cx=tc.getContext('2d');var id=cx.createImageData(128,128);
  for(var i=0;i<id.data.length;i+=4){var v=Math.floor(Math.random()*255);id.data[i]=v;id.data[i+1]=v;id.data[i+2]=v;id.data[i+3]=15;}
  cx.putImageData(id,0,0);
  document.getElementById('paper-texture').style.backgroundImage='url('+tc.toDataURL()+')';
  initCanvas();genDecos();renderDeco();
  addUserMarker();
  if(window.pendingMarkers){updateMarkers(window.pendingMarkers);window.pendingMarkers=null;}
});
map.on('move',function(){requestAnimationFrame(renderDeco);});
map.on('resize',function(){initCanvas();renderDeco();});

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
  nm.forEach(function(m){var el=createMarkerEl(m);var mk=new mapboxgl.Marker({element:el,anchor:'center'}).setLngLat([m.longitude,m.latitude]).addTo(map);markerElements.push(mk);});
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
