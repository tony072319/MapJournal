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

// Custom dramatic style from Mapbox Studio with 3D buildings
var map = new mapboxgl.Map({
  container: 'map',
  center: [userLng, userLat],
  zoom: 16,
  style: 'mapbox://styles/tonybyao/cmnv1iel9005101sv4xf2bao2',
  attributionControl: false,
  pitch: 45,
  bearing: -17.6
});

// Hide Mapbox logo after load
map.on('load', function() {
  document.querySelectorAll('.mapboxgl-ctrl-logo').forEach(function(el) {
    el.style.display = 'none';
  });
});

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
}

function zoomIn() { map.zoomTo(map.getZoom() + 1, { duration: 300 }); }
function zoomOut() { map.zoomTo(map.getZoom() - 1, { duration: 300 }); }
function recenter() { map.flyTo({ center: [userLng, userLat], zoom: 16, pitch: 45, bearing: -17.6, duration: 600 }); }

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
