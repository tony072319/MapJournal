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

  // Update markers when they change
  React.useEffect(() => {
    webViewRef.current?.injectJavaScript(`
      window.updateMarkers(${markersJSON});
      true;
    `);
  }, [markersJSON]);

  // Update location when it changes
  React.useEffect(() => {
    webViewRef.current?.injectJavaScript(`
      window.updateUserLocation(${location.latitude}, ${location.longitude});
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
        onError={(e) => console.log('WebView error:', e.nativeEvent)}
      />
    </View>
  );
};

function generateHTML(location: UserLocation, initialMarkers: MarkerData[]): string {
  return `
<!DOCTYPE html>
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

.marker-container {
  cursor: pointer;
  position: relative;
}
.marker-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: #FFFFFF;
  border: 2px solid rgba(124,108,240,0.35);
  box-shadow: 0 4px 12px rgba(124,108,240,0.15);
  position: relative;
}
.marker-inner {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.marker-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #FF7EB3;
  color: white;
  font-size: 10px;
  font-weight: 800;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid #FFF;
}

.user-location {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #7C6CF0;
  border: 3px solid #FFFFFF;
  box-shadow: 0 0 0 8px rgba(124,108,240,0.2), 0 2px 8px rgba(0,0,0,0.15);
}

.controls {
  position: absolute;
  right: 14px;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
}
.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: rgba(255,255,255,0.88);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 300;
  color: #2D2B3D;
  box-shadow: 0 1px 4px rgba(124,108,240,0.06);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.ctrl-btn:active { background: rgba(255,255,255,1); }
.loc-icon {
  width: 14px;
  height: 14px;
  border-radius: 7px;
  border: 1.5px solid #7C6CF0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.loc-dot {
  width: 4px;
  height: 4px;
  border-radius: 2px;
  background: #7C6CF0;
}

.attribution {
  position: absolute;
  bottom: 4px;
  left: 8px;
  font-size: 8px;
  color: rgba(0,0,0,0.15);
  font-family: -apple-system, sans-serif;
  z-index: 10;
}
</style>
</head>
<body>
<div id="map"></div>

<div class="controls">
  <button class="ctrl-btn" onclick="zoomIn()">+</button>
  <button class="ctrl-btn" onclick="zoomOut()">\u2212</button>
  <div style="height:10px"></div>
  <button class="ctrl-btn" onclick="recenter()">
    <div class="loc-icon"><div class="loc-dot"></div></div>
  </button>
</div>

<div class="attribution">\u00a9 Mapbox \u00a9 OpenStreetMap</div>

<script>
mapboxgl.accessToken = '${MAPBOX_TOKEN}';

var userLat = ${location.latitude};
var userLng = ${location.longitude};
var markerElements = [];

var map = new mapboxgl.Map({
  container: 'map',
  center: [userLng, userLat],
  zoom: 16,
  style: {
    version: 8,
    name: 'MapJournal Illustrated',
    sources: {
      'mapbox-streets': {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-streets-v8'
      }
    },
    glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
    sprite: 'mapbox://sprites/mapbox/light-v11',
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#FFF8F0' } },
      { id: 'water', type: 'fill', source: 'mapbox-streets', 'source-layer': 'water',
        paint: { 'fill-color': '#B8D4E3', 'fill-opacity': 0.7 } },
      { id: 'landuse-park', type: 'fill', source: 'mapbox-streets', 'source-layer': 'landuse',
        filter: ['==', 'class', 'park'],
        paint: { 'fill-color': '#C8E6C0', 'fill-opacity': 0.6 } },
      { id: 'landuse-grass', type: 'fill', source: 'mapbox-streets', 'source-layer': 'landuse',
        filter: ['in', 'class', 'grass', 'scrub'],
        paint: { 'fill-color': '#D5EDCC', 'fill-opacity': 0.4 } },
      { id: 'building', type: 'fill', source: 'mapbox-streets', 'source-layer': 'building',
        paint: { 'fill-color': '#E8E0D8', 'fill-opacity': 0.6, 'fill-outline-color': '#D8CFBE' } },
      { id: 'road-motorway', type: 'line', source: 'mapbox-streets', 'source-layer': 'road',
        filter: ['in', 'class', 'motorway', 'trunk'],
        paint: { 'line-color': '#F2D5A0', 'line-width': 3, 'line-opacity': 0.8 },
        layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'road-primary', type: 'line', source: 'mapbox-streets', 'source-layer': 'road',
        filter: ['in', 'class', 'primary', 'secondary'],
        paint: { 'line-color': '#E8DFD0', 'line-width': 2, 'line-opacity': 0.8 },
        layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'road-street', type: 'line', source: 'mapbox-streets', 'source-layer': 'road',
        filter: ['in', 'class', 'tertiary', 'street', 'service', 'path', 'pedestrian'],
        paint: { 'line-color': '#F0E8DC', 'line-width': 1, 'line-opacity': 0.6 },
        layout: { 'line-cap': 'round', 'line-join': 'round' } },
      { id: 'poi-label', type: 'symbol', source: 'mapbox-streets', 'source-layer': 'poi_label',
        filter: ['<=', 'filterrank', 2],
        layout: { 'text-field': ['get', 'name'], 'text-size': 10,
          'text-font': ['DIN Pro Regular', 'Arial Unicode MS Regular'],
          'icon-image': ['get', 'maki'], 'icon-size': 0.7, 'icon-allow-overlap': false },
        paint: { 'text-color': '#C4A882', 'text-halo-color': '#FFF8F0', 'text-halo-width': 1.5,
          'icon-opacity': 0.6 } },
      { id: 'road-label', type: 'symbol', source: 'mapbox-streets', 'source-layer': 'road',
        filter: ['in', 'class', 'primary', 'secondary', 'tertiary', 'motorway', 'trunk'],
        layout: { 'text-field': ['get', 'name'], 'text-size': 10, 'symbol-placement': 'line',
          'text-font': ['DIN Pro Regular', 'Arial Unicode MS Regular'] },
        paint: { 'text-color': '#B8A48C', 'text-halo-color': '#FFF8F0', 'text-halo-width': 1.2 } },
      { id: 'place-label', type: 'symbol', source: 'mapbox-streets', 'source-layer': 'place_label',
        layout: { 'text-field': ['get', 'name'], 'text-size': ['interpolate', ['linear'], ['zoom'], 10, 12, 15, 14],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'] },
        paint: { 'text-color': '#9B8B78', 'text-halo-color': '#FFF8F0', 'text-halo-width': 1.5 } }
    ]
  },
  attributionControl: false
});

// Hide mapbox logo
map.on('load', function() {
  var logos = document.querySelectorAll('.mapboxgl-ctrl-logo');
  logos.forEach(function(el) { el.style.display = 'none'; });
});

// User location marker
var userEl = document.createElement('div');
userEl.className = 'user-location';
var userMarker = new mapboxgl.Marker({ element: userEl })
  .setLngLat([userLng, userLat])
  .addTo(map);

// Pulse animation for user location
var pulse = document.createElement('style');
pulse.textContent = '@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(124,108,240,0.4)}70%{box-shadow:0 0 0 20px rgba(124,108,240,0)}100%{box-shadow:0 0 0 0 rgba(124,108,240,0)}}.user-location{animation:pulse 2s infinite}';
document.head.appendChild(pulse);

function createMarkerEl(m) {
  var container = document.createElement('div');
  container.className = 'marker-container';

  var bubble = document.createElement('div');
  bubble.className = 'marker-bubble';
  bubble.style.borderColor = m.moodColor + '60';

  var inner = document.createElement('div');
  inner.className = 'marker-inner';
  inner.style.backgroundColor = m.moodColor + '15';
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
  // Remove old markers
  markerElements.forEach(function(m) { m.remove(); });
  markerElements = [];

  // Add new markers
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

function zoomIn() {
  map.zoomTo(map.getZoom() + 1, { duration: 300 });
}

function zoomOut() {
  map.zoomTo(map.getZoom() - 1, { duration: 300 });
}

function recenter() {
  map.flyTo({ center: [userLng, userLat], zoom: 16, duration: 500 });
}

// Make functions available globally
window.updateMarkers = updateMarkers;
window.updateUserLocation = updateUserLocation;

// Initial markers
updateMarkers(${JSON.stringify(initialMarkers)});
</script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: '#FAF7F2' },
});
