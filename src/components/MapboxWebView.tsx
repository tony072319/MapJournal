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

/* Decorative illustrations scattered on map */
.decor-marker {
  pointer-events: none;
  filter: drop-shadow(1.5px 2.5px 2px rgba(50,30,10,0.2));
  will-change: transform;
}
.decor-marker svg { display: block; overflow: visible; }
.decor-cloud {
  filter: drop-shadow(1px 3px 5px rgba(100,120,140,0.2));
  opacity: 0.92;
}
.decor-birds {
  filter: none;
  opacity: 0.85;
}
.decor-mountain {
  filter: drop-shadow(2px 3px 3px rgba(40,50,70,0.25));
  opacity: 0.9;
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
var STADIA_KEY = '4a424ba4-2339-4ea3-8659-c06f29b42691';
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
          'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg?api_key=' + STADIA_KEY
        ],
        tileSize: 256,
        maxzoom: 18,
        attribution: '© Stadia Maps, © Stamen Design, © OpenStreetMap'
      },
      'stamen-labels': {
        type: 'raster',
        tiles: [
          'https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}.png?api_key=' + STADIA_KEY
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
  // Order matters: decorations first (below), then markers (above)
  scatterDecorations();
  addUserMarker();
  if (window.pendingMarkers) {
    updateMarkers(window.pendingMarkers);
    window.pendingMarkers = null;
  }
});

// ---------- Hand-drawn SVG decorations (17 types) ----------
var DECOR_SVGS = {
  // Tall 3-tier pagoda with curved eaves (East Asian temple)
  pagoda3: '<svg width="56" height="72" viewBox="0 0 56 72"><line x1="28" y1="8" x2="28" y2="3" stroke="#2C1810" stroke-width="1.8"/><circle cx="28" cy="3" r="2.5" fill="#D9A94A" stroke="#2C1810" stroke-width="1.5"/><path d="M12 18 Q28 8 44 18 Q46 19 43 21 L13 21 Q10 19 12 18 Z" fill="#8B3A2C" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><rect x="18" y="21" width="20" height="10" fill="#E8D4A8" stroke="#2C1810" stroke-width="1.5"/><rect x="22" y="24" width="5" height="7" fill="#8B3A2C"/><rect x="29" y="24" width="5" height="7" fill="#8B3A2C"/><path d="M8 34 Q28 24 48 34 Q50 35 47 37 L9 37 Q6 35 8 34 Z" fill="#A0453A" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><rect x="14" y="37" width="28" height="12" fill="#F4E4C1" stroke="#2C1810" stroke-width="1.5"/><rect x="18" y="40" width="6" height="9" fill="#8B3A2C"/><rect x="26" y="40" width="6" height="9" fill="#8B3A2C"/><rect x="34" y="40" width="4" height="9" fill="#8B3A2C"/><path d="M4 52 Q28 42 52 52 Q54 53 51 55 L5 55 Q2 53 4 52 Z" fill="#B8554A" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><rect x="10" y="55" width="36" height="14" fill="#D9553C" stroke="#2C1810" stroke-width="1.8"/><rect x="24" y="58" width="8" height="11" fill="#2C1810"/><rect x="14" y="58" width="6" height="6" fill="#F4E4C1" stroke="#2C1810" stroke-width="1"/><rect x="36" y="58" width="6" height="6" fill="#F4E4C1" stroke="#2C1810" stroke-width="1"/></svg>',

  // Red temple gate (torii style with tile roof)
  gate: '<svg width="58" height="56" viewBox="0 0 58 56"><path d="M2 20 Q29 6 56 20 Q58 21 55 23 L3 23 Q0 21 2 20 Z" fill="#8B3A2C" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><rect x="4" y="23" width="50" height="4" fill="#D9A94A" stroke="#2C1810" stroke-width="1.5"/><rect x="8" y="27" width="6" height="22" fill="#8B4513" stroke="#2C1810" stroke-width="1.8"/><rect x="44" y="27" width="6" height="22" fill="#8B4513" stroke="#2C1810" stroke-width="1.8"/><rect x="18" y="30" width="22" height="19" fill="#F4E4C1" stroke="#2C1810" stroke-width="1.8"/><path d="M18 40 L40 40" stroke="#2C1810" stroke-width="1.2"/><circle cx="29" cy="36" r="2" fill="#D9553C" stroke="#2C1810" stroke-width="1"/></svg>',

  // Tall spindly pine (like reference 1/3)
  pineTall: '<svg width="26" height="58" viewBox="0 0 26 58"><path d="M13 3 L6 20 L10 20 L4 32 L9 32 L3 44 L11 44 L11 50 L15 50 L15 44 L23 44 L17 32 L22 32 L16 20 L20 20 Z" fill="#5F9C52" stroke="#1F3D18" stroke-width="1.8" stroke-linejoin="round"/><rect x="11" y="48" width="4" height="7" fill="#5D3A1A" stroke="#2C1810" stroke-width="1"/></svg>',

  // Round oak/leafy tree
  oakTree: '<svg width="38" height="48" viewBox="0 0 38 48"><circle cx="19" cy="18" r="15" fill="#7EB854" stroke="#1F3D18" stroke-width="1.8"/><circle cx="13" cy="13" r="5" fill="#9ECC70" opacity="0.7"/><circle cx="24" cy="16" r="3" fill="#9ECC70" opacity="0.7"/><rect x="17" y="32" width="4" height="12" fill="#5D3A1A" stroke="#2C1810" stroke-width="1"/><path d="M19 32 L19 36" stroke="#2C1810" stroke-width="1"/></svg>',

  // Bare branching winter tree (dark)
  bareBranch: '<svg width="32" height="44" viewBox="0 0 32 44"><path d="M16 42 L16 18 M16 18 L8 8 M16 18 L24 10 M16 24 L6 20 M16 24 L26 18 M16 30 L10 28 M16 30 L22 26" stroke="#3A2818" stroke-width="2" stroke-linecap="round" fill="none"/><rect x="14" y="38" width="4" height="6" fill="#3A2818"/></svg>',

  // Autumn round tree (orange/red)
  autumnTree: '<svg width="32" height="40" viewBox="0 0 32 40"><circle cx="16" cy="15" r="13" fill="#D97040" stroke="#6B2E10" stroke-width="1.8"/><circle cx="10" cy="10" r="3" fill="#F4A060" opacity="0.7"/><circle cx="21" cy="18" r="2.5" fill="#B85520" opacity="0.7"/><rect x="14" y="27" width="4" height="9" fill="#5D3A1A" stroke="#2C1810" stroke-width="1"/></svg>',

  // Teal mushroom-shaped tree
  tealDome: '<svg width="36" height="42" viewBox="0 0 36 42"><path d="M6 20 Q6 6 18 4 Q30 6 30 20 Q30 24 26 24 L10 24 Q6 24 6 20 Z" fill="#4A9AA8" stroke="#1A454F" stroke-width="1.8" stroke-linejoin="round"/><circle cx="13" cy="13" r="3" fill="#6CBCC8" opacity="0.6"/><rect x="16" y="24" width="4" height="12" fill="#5D3A1A" stroke="#2C1810" stroke-width="1"/></svg>',

  // Tall pine tree (narrow)
  pineNarrow: '<svg width="22" height="54" viewBox="0 0 22 54"><path d="M11 3 L5 18 L8 18 L3 30 L7 30 L2 42 L9 42 L9 48 L13 48 L13 42 L20 42 L15 30 L19 30 L14 18 L17 18 Z" fill="#4A7C3E" stroke="#1F3D18" stroke-width="1.8" stroke-linejoin="round"/><rect x="9" y="46" width="4" height="6" fill="#5D3A1A"/></svg>',

  // Wispy cloud
  cloud: '<svg width="64" height="32" viewBox="0 0 64 32"><ellipse cx="14" cy="18" rx="12" ry="9" fill="#FFFFFF" stroke="#7A8E9E" stroke-width="1.8"/><ellipse cx="32" cy="14" rx="16" ry="11" fill="#FFFFFF" stroke="#7A8E9E" stroke-width="1.8"/><ellipse cx="50" cy="18" rx="12" ry="9" fill="#FFFFFF" stroke="#7A8E9E" stroke-width="1.8"/></svg>',

  // Flying birds (V shapes)
  birds: '<svg width="40" height="16" viewBox="0 0 40 16"><path d="M2 8 Q6 3 10 8 Q14 3 18 8" stroke="#3A2818" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M22 5 Q26 1 30 5" stroke="#3A2818" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M32 10 Q36 6 40 10" stroke="#3A2818" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',

  // Flower cluster
  flowers: '<svg width="32" height="28" viewBox="0 0 32 28"><circle cx="9" cy="11" r="4.5" fill="#FF6B9D" stroke="#6B1F3F" stroke-width="1.4"/><circle cx="20" cy="8" r="4.5" fill="#FFB84D" stroke="#6B4A1A" stroke-width="1.4"/><circle cx="16" cy="19" r="4.5" fill="#E64F80" stroke="#6B1F3F" stroke-width="1.4"/><circle cx="9" cy="11" r="1.8" fill="#FFE4B5"/><circle cx="20" cy="8" r="1.8" fill="#FFE4B5"/><circle cx="16" cy="19" r="1.8" fill="#FFE4B5"/></svg>',

  // Stone rock
  rock: '<svg width="30" height="24" viewBox="0 0 30 24"><path d="M2 20 Q3 10 11 7 Q21 5 26 13 Q28 19 24 22 Q12 24 2 20 Z" fill="#9B8B7A" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 14 L12 12 L15 14" stroke="#5D4030" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',

  // Stone lantern (Japanese)
  lantern: '<svg width="24" height="42" viewBox="0 0 24 42"><rect x="8" y="34" width="8" height="5" fill="#9B8B7A" stroke="#2C1810" stroke-width="1.5"/><rect x="6" y="30" width="12" height="5" fill="#A89880" stroke="#2C1810" stroke-width="1.5"/><rect x="7" y="18" width="10" height="13" fill="#D4C5A8" stroke="#2C1810" stroke-width="1.5"/><circle cx="12" cy="25" r="2.5" fill="#FFD76B"/><path d="M4 17 L20 17 L16 14 L8 14 Z" fill="#9B8B7A" stroke="#2C1810" stroke-width="1.5" stroke-linejoin="round"/><rect x="10" y="10" width="4" height="4" fill="#9B8B7A" stroke="#2C1810" stroke-width="1.2"/></svg>',

  // Mountain with snow cap
  mountain: '<svg width="56" height="42" viewBox="0 0 56 42"><path d="M4 38 L20 12 L28 22 L38 8 L52 38 Z" fill="#8FA4B0" stroke="#2C3E50" stroke-width="1.8" stroke-linejoin="round"/><path d="M16 18 L20 12 L24 18 L20 16 Z" fill="#FFFFFF"/><path d="M34 14 L38 8 L42 14 L38 12 Z" fill="#FFFFFF"/></svg>',

  // Bamboo cluster
  bamboo: '<svg width="28" height="54" viewBox="0 0 28 54"><path d="M8 50 L8 6" stroke="#7AA050" stroke-width="3.5" stroke-linecap="round"/><path d="M14 50 L14 10" stroke="#5F8A38" stroke-width="3.5" stroke-linecap="round"/><path d="M20 50 L20 8" stroke="#7AA050" stroke-width="3.5" stroke-linecap="round"/><path d="M5 12 L11 12 M11 22 L17 22 M17 14 L23 14 M5 32 L11 32 M11 38 L17 38 M17 28 L23 28" stroke="#3D5A1C" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="4" cy="8" rx="4" ry="2" fill="#7AA050" stroke="#3D5A1C" stroke-width="1"/><ellipse cx="24" cy="10" rx="4" ry="2" fill="#7AA050" stroke="#3D5A1C" stroke-width="1"/></svg>',

  // Traditional tile-roof house
  house: '<svg width="40" height="42" viewBox="0 0 40 42"><path d="M2 20 L20 6 L38 20 Q39 21 37 23 L3 23 Q1 21 2 20 Z" fill="#5D3A1A" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><rect x="6" y="23" width="28" height="16" fill="#F4D4A8" stroke="#2C1810" stroke-width="1.8"/><rect x="15" y="28" width="8" height="12" fill="#5D3A1A" stroke="#2C1810" stroke-width="1.5"/><rect x="25" y="27" width="6" height="6" fill="#85C9D0" stroke="#2C1810" stroke-width="1.2"/><path d="M25 30 L31 30 M28 27 L28 33" stroke="#2C1810" stroke-width="0.8"/></svg>',

  // Sailboat
  boat: '<svg width="42" height="38" viewBox="0 0 42 38"><path d="M4 28 L38 28 L34 34 L8 34 Z" fill="#8B4513" stroke="#2C1810" stroke-width="1.8" stroke-linejoin="round"/><line x1="21" y1="28" x2="21" y2="6" stroke="#5D3A1A" stroke-width="2" stroke-linecap="round"/><path d="M21 8 Q32 14 30 24 L21 24 Z" fill="#F4E4C1" stroke="#2C1810" stroke-width="1.5" stroke-linejoin="round"/><path d="M21 10 Q14 18 15 26 L21 26 Z" fill="#D9553C" stroke="#2C1810" stroke-width="1.5" stroke-linejoin="round"/></svg>'
};

var decorMarkers = [];

function scatterDecorations() {
  // Clear old decorations
  decorMarkers.forEach(function(m) { m.remove(); });
  decorMarkers = [];

  // Seeded random so decorations stay in same place across re-renders
  var seed = Math.floor(userLat * 10000) + Math.floor(userLng * 10000);
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  // Weighted type distribution — lots of trees, fewer buildings, occasional special
  var typePool = [
    'pineTall','pineTall','pineTall','pineNarrow','pineNarrow',
    'oakTree','oakTree','oakTree','oakTree',
    'bareBranch','bareBranch',
    'autumnTree','autumnTree',
    'tealDome','tealDome','tealDome',
    'bamboo','bamboo',
    'flowers','flowers','flowers',
    'rock','rock',
    'lantern',
    'pagoda3','pagoda3',
    'gate','gate',
    'house','house','house',
    'cloud','cloud','cloud',
    'birds','birds','birds',
    'mountain',
    'boat'
  ];

  // Grid-based distribution — 11x11 cells around user, each cell gets 1-2 decorations
  // Total: roughly 130-180 decorations spread evenly
  var gridSize = 11;
  var cellStep = 0.0035; // ~350m per cell
  var startLat = userLat - (gridSize * cellStep) / 2;
  var startLng = userLng - (gridSize * cellStep * 1.3) / 2;

  for (var gx = 0; gx < gridSize; gx++) {
    for (var gy = 0; gy < gridSize; gy++) {
      var cellCenterLat = startLat + gy * cellStep;
      var cellCenterLng = startLng + gx * cellStep * 1.3;

      // Distance from user in cell units
      var dcx = gx - gridSize / 2;
      var dcy = gy - gridSize / 2;
      var cellDist = Math.sqrt(dcx * dcx + dcy * dcy);

      // Skip cells too close to user (keep clear zone for marker)
      if (cellDist < 1.2) continue;

      // Number of decorations per cell (1-2, less at edges)
      var decorPerCell = cellDist > 4.5 ? 1 : (rand() > 0.3 ? 2 : 1);

      for (var n = 0; n < decorPerCell; n++) {
        // Jitter within cell
        var jitLat = (rand() - 0.5) * cellStep * 0.85;
        var jitLng = (rand() - 0.5) * cellStep * 0.85 * 1.3;
        var lat = cellCenterLat + jitLat;
        var lng = cellCenterLng + jitLng;

        // Special types more likely at certain positions
        var type;
        var r = rand();
        if (cellDist > 3.5 && r < 0.08) {
          type = 'cloud';
        } else if (cellDist > 3 && r < 0.06) {
          type = 'birds';
        } else if (cellDist > 4 && r < 0.04) {
          type = 'mountain';
        } else {
          type = typePool[Math.floor(rand() * typePool.length)];
        }

        var svg = DECOR_SVGS[type];
        if (!svg) continue;

        var el = document.createElement('div');
        el.className = 'decor-marker decor-' + type;
        el.innerHTML = svg;
        var scale = 0.75 + rand() * 0.55;
        var rotate = (rand() - 0.5) * 10;
        el.style.transform = 'scale(' + scale + ') rotate(' + rotate + 'deg)';
        el.style.pointerEvents = 'none';
        el.style.transformOrigin = 'center bottom';

        var marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map);
        decorMarkers.push(marker);
      }
    }
  }
}

// User location marker — created after decorations for correct z-order
var userMarker = null;
function addUserMarker() {
  var userWrapper = document.createElement('div');
  userWrapper.className = 'user-dot-wrapper';
  userWrapper.innerHTML = '<div class="user-dot-pulse"></div><div class="user-dot"></div>';
  userMarker = new mapboxgl.Marker({ element: userWrapper })
    .setLngLat([userLng, userLat])
    .addTo(map);
}

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
  if (!map.isStyleLoaded()) {
    window.pendingMarkers = newMarkers;
    return;
  }
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
  if (userMarker) userMarker.setLngLat([lng, lat]);
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
