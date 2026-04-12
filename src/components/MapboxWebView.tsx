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
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; }
#map { width: 100%; height: 100%; }
.mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib { display: none !important; }

.marker-container { cursor: pointer; position: relative; }
.marker-bubble {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 24px;
  background: #FFFFFF; border: 2.5px solid rgba(124,108,240,0.3);
  box-shadow: 0 4px 14px rgba(124,108,240,0.18);
  position: relative; transition: transform 0.15s;
}
.marker-bubble:active { transform: scale(0.92); }
.marker-inner {
  width: 40px; height: 40px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.marker-badge {
  position: absolute; top: -5px; right: -5px;
  background: linear-gradient(135deg, #FF7EB3, #FF5A8A); color: white;
  font-size: 10px; font-weight: 800; min-width: 20px; height: 20px;
  border-radius: 10px; display: flex; align-items: center; justify-content: center;
  padding: 0 5px; border: 2px solid #FFF;
}

.user-dot-wrapper { position: relative; width: 24px; height: 24px; }
.user-dot-pulse {
  position: absolute; top: -8px; left: -8px; width: 40px; height: 40px;
  border-radius: 50%; background: rgba(124,108,240,0.15);
  animation: pulse 2s ease-out infinite;
}
.user-dot {
  position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
  border-radius: 50%; background: #7C6CF0;
  border: 3px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(124,108,240,0.4);
}
@keyframes pulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}

.controls {
  position: absolute; right: 14px; top: 100px;
  display: flex; flex-direction: column; gap: 6px; z-index: 20;
}
.ctrl-btn {
  width: 38px; height: 38px; border-radius: 19px;
  background: rgba(255,255,255,0.92); border: none;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 300; color: #2D2B3D;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.ctrl-btn:active { background: rgba(255,255,255,1); transform: scale(0.92); }
.loc-icon {
  width: 16px; height: 16px; border-radius: 8px;
  border: 2px solid #7C6CF0;
  display: flex; align-items: center; justify-content: center;
}
.loc-dot { width: 5px; height: 5px; border-radius: 50%; background: #7C6CF0; }

.attr {
  position: absolute; bottom: 4px; left: 8px;
  font-size: 8px; color: rgba(0,0,0,0.12);
  font-family: -apple-system, sans-serif; z-index: 20;
}
.mapboxgl-marker { z-index: 15 !important; }

/* Decorative illustrations scattered on map */
.decor-marker {
  pointer-events: none;
  filter: drop-shadow(1px 2px 2px rgba(0,0,0,0.12));
}
.decor-marker svg { display: block; }
.decor-cloud {
  filter: drop-shadow(1px 2px 4px rgba(100,120,140,0.15));
  opacity: 0.85;
}
</style>
</head>
<body>
<div id="map"></div>
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

// Stamen Watercolor base layer via Stadia Maps — real watercolor-painted map tiles
var map = new mapboxgl.Map({
  container: 'map',
  center: [userLng, userLat],
  zoom: 15.5,
  style: {
    version: 8,
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sources: {
      'stamen-watercolor': {
        type: 'raster',
        tiles: [
          'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg'
        ],
        tileSize: 256,
        maxzoom: 18,
        attribution: '© Stadia Maps, © Stamen Design, © OpenStreetMap'
      },
      'stamen-labels': {
        type: 'raster',
        tiles: [
          'https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        maxzoom: 20
      }
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#F5EDD5' }
      },
      {
        id: 'watercolor-layer',
        type: 'raster',
        source: 'stamen-watercolor',
        paint: { 'raster-opacity': 1, 'raster-fade-duration': 300 }
      },
      {
        id: 'labels-layer',
        type: 'raster',
        source: 'stamen-labels',
        paint: { 'raster-opacity': 0.85, 'raster-fade-duration': 300 }
      }
    ]
  },
  attributionControl: false,
  pitch: 0,
  bearing: 0
});

// Hide Mapbox logo after load
map.on('load', function() {
  document.querySelectorAll('.mapboxgl-ctrl-logo').forEach(function(el) {
    el.style.display = 'none';
  });
  scatterDecorations();
});

// ---------- Hand-drawn SVG decorations ----------
var DECOR_SVGS = {
  pineTree: '<svg width="32" height="42" viewBox="0 0 32 42"><path d="M16 3 L6 22 L11 22 L4 32 L14 32 L14 38 L18 38 L18 32 L28 32 L21 22 L26 22 Z" fill="#7EB854" stroke="#2D5016" stroke-width="1.8" stroke-linejoin="round"/><rect x="14" y="36" width="4" height="5" fill="#5D3A1A"/></svg>',
  roundTree: '<svg width="30" height="38" viewBox="0 0 30 38"><circle cx="15" cy="15" r="12" fill="#8FC564" stroke="#2D5016" stroke-width="1.8"/><circle cx="10" cy="12" r="3" fill="#A8D97D" opacity="0.6"/><rect x="13" y="26" width="4" height="8" fill="#5D3A1A"/></svg>',
  autumnTree: '<svg width="28" height="36" viewBox="0 0 28 36"><ellipse cx="14" cy="13" rx="11" ry="10" fill="#E89960" stroke="#8B4A1E" stroke-width="1.8"/><circle cx="10" cy="10" r="2.5" fill="#FFB87A" opacity="0.7"/><rect x="12" y="21" width="4" height="9" fill="#5D3A1A"/></svg>',
  tealTree: '<svg width="32" height="40" viewBox="0 0 32 40"><ellipse cx="16" cy="14" rx="13" ry="11" fill="#5FAFB8" stroke="#1E4550" stroke-width="1.8"/><circle cx="11" cy="11" r="3" fill="#85C9D0" opacity="0.6"/><rect x="14" y="24" width="4" height="9" fill="#5D3A1A"/></svg>',
  pagoda: '<svg width="44" height="52" viewBox="0 0 44 52"><polygon points="4,22 22,12 40,22" fill="#8B4513" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><polygon points="8,36 22,28 36,36" fill="#A0522D" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><rect x="10" y="36" width="24" height="12" fill="#D9553C" stroke="#2C1810" stroke-width="1.8"/><rect x="20" y="40" width="4" height="8" fill="#F4E4C1"/><line x1="22" y1="12" x2="22" y2="8" stroke="#2C1810" stroke-width="1.5"/><circle cx="22" cy="6" r="2" fill="#FFD700" stroke="#2C1810" stroke-width="1"/></svg>',
  templeGate: '<svg width="48" height="44" viewBox="0 0 48 44"><rect x="6" y="22" width="6" height="18" fill="#8B4513" stroke="#2C1810" stroke-width="1.8"/><rect x="36" y="22" width="6" height="18" fill="#8B4513" stroke="#2C1810" stroke-width="1.8"/><polygon points="2,22 24,12 46,22" fill="#D9553C" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><rect x="2" y="20" width="44" height="4" fill="#8B4513" stroke="#2C1810" stroke-width="1.5"/></svg>',
  flowerCluster: '<svg width="28" height="26" viewBox="0 0 28 26"><circle cx="8" cy="10" r="4" fill="#FF6B9D" stroke="#8B2244" stroke-width="1.2"/><circle cx="18" cy="8" r="4" fill="#FFB84D" stroke="#8B5A1A" stroke-width="1.2"/><circle cx="14" cy="17" r="4" fill="#FF6B9D" stroke="#8B2244" stroke-width="1.2"/><circle cx="8" cy="10" r="1.5" fill="#FFE4B5"/><circle cx="18" cy="8" r="1.5" fill="#FFE4B5"/><circle cx="14" cy="17" r="1.5" fill="#FFE4B5"/></svg>',
  cloud: '<svg width="50" height="26" viewBox="0 0 50 26"><ellipse cx="12" cy="14" rx="10" ry="8" fill="#FFFFFF" stroke="#B8C5D0" stroke-width="1.5"/><ellipse cx="25" cy="11" rx="12" ry="9" fill="#FFFFFF" stroke="#B8C5D0" stroke-width="1.5"/><ellipse cx="38" cy="14" rx="9" ry="7" fill="#FFFFFF" stroke="#B8C5D0" stroke-width="1.5"/></svg>',
  rock: '<svg width="26" height="22" viewBox="0 0 26 22"><path d="M2 18 Q4 10 10 8 Q18 6 22 12 Q24 18 20 20 Q10 22 2 18 Z" fill="#9B8B7A" stroke="#3E2E1E" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="10" cy="13" rx="2" ry="1" fill="#B8A890" opacity="0.6"/></svg>',
  house: '<svg width="36" height="38" viewBox="0 0 36 38"><rect x="6" y="18" width="24" height="16" fill="#F4D4A8" stroke="#2C1810" stroke-width="1.8"/><polygon points="3,18 18,6 33,18" fill="#C23616" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><rect x="14" y="24" width="6" height="10" fill="#5D3A1A" stroke="#2C1810" stroke-width="1.2"/><rect x="22" y="22" width="5" height="5" fill="#85C9D0" stroke="#2C1810" stroke-width="1.2"/></svg>'
};

var decorMarkers = [];

function scatterDecorations() {
  // Clear old decorations
  decorMarkers.forEach(function(m) { m.remove(); });
  decorMarkers = [];

  // Seeded random so decorations stay in same place across re-renders
  var seed = Math.floor(userLat * 1000) + Math.floor(userLng * 1000);
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  var types = ['pineTree','pineTree','roundTree','roundTree','autumnTree','tealTree','tealTree','flowerCluster','rock','pineTree','roundTree','pagoda','templeGate','house','cloud'];

  // Generate 50 decorations in a spiral pattern around user, avoiding center
  var count = 60;
  for (var i = 0; i < count; i++) {
    var angle = rand() * Math.PI * 2;
    var minDist = 0.003; // ~300m — leave space around user
    var maxDist = 0.025; // ~2.5km
    var dist = minDist + rand() * (maxDist - minDist);
    var lat = userLat + Math.sin(angle) * dist;
    var lng = userLng + Math.cos(angle) * dist * 1.3; // compensate for longitude compression

    var type = types[Math.floor(rand() * types.length)];
    var svg = DECOR_SVGS[type];

    var el = document.createElement('div');
    el.className = 'decor-marker decor-' + type;
    el.innerHTML = svg;
    var scale = 0.8 + rand() * 0.6;
    var rotate = (rand() - 0.5) * 12;
    el.style.transform = 'scale(' + scale + ') rotate(' + rotate + 'deg)';
    el.style.pointerEvents = 'none';
    el.style.transformOrigin = 'center bottom';

    var marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(map);
    decorMarkers.push(marker);
  }
}

// User location marker with pulse animation
var userWrapper = document.createElement('div');
userWrapper.className = 'user-dot-wrapper';
userWrapper.innerHTML = '<div class="user-dot-pulse"></div><div class="user-dot"></div>';
var userMarker = new mapboxgl.Marker({ element: userWrapper })
  .setLngLat([userLng, userLat])
  .addTo(map);

function createMarkerEl(m) {
  var container = document.createElement('div');
  container.className = 'marker-container';
  var bubble = document.createElement('div');
  bubble.className = 'marker-bubble';
  bubble.style.borderColor = m.moodColor + '50';
  var inner = document.createElement('div');
  inner.className = 'marker-inner';
  inner.style.backgroundColor = m.moodColor + '18';
  inner.textContent = m.emoji;
  bubble.appendChild(inner);
  if (m.count && m.count > 1) {
    var badge = document.createElement('div');
    badge.className = 'marker-badge';
    badge.textContent = m.count;
    bubble.appendChild(badge);
  }
  container.appendChild(bubble);
  container.addEventListener('click', function(e) {
    e.stopPropagation();
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: m.id }));
  });
  return container;
}

function updateMarkers(newMarkers) {
  markerElements.forEach(function(m) { m.remove(); });
  markerElements = [];
  newMarkers.forEach(function(m) {
    var el = createMarkerEl(m);
    var marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat([m.longitude, m.latitude])
      .addTo(map);
    markerElements.push(marker);
  });
}

function updateUserLocation(lat, lng) {
  userLat = lat;
  userLng = lng;
  userMarker.setLngLat([lng, lat]);
  if (map.isStyleLoaded()) scatterDecorations();
}

function zoomIn() { map.zoomTo(map.getZoom() + 1, { duration: 300 }); }
function zoomOut() { map.zoomTo(map.getZoom() - 1, { duration: 300 }); }
function recenter() { map.flyTo({ center: [userLng, userLat], zoom: 15.5, pitch: 0, bearing: 0, duration: 600 }); }

window.updateMarkers = updateMarkers;
window.updateUserLocation = updateUserLocation;

updateMarkers(${JSON.stringify(initialMarkers)});
</script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: '#F7F5F0' },
});
