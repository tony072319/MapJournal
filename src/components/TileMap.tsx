import React, { useMemo, useState, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { UserLocation } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TILE_SIZE = 256;

// 地图风格 — 全部无需API key，用颜色叠加层创造不同氛围
export const MAP_STYLES = {
  soft: {
    url: 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png',
    label: '柔和',
    icon: '🌸',
    tint: 'rgba(245, 235, 255, 0.35)',
    bg: '#F8F4FF',
  },
  warm: {
    url: 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png',
    label: '温暖',
    icon: '🌅',
    tint: 'rgba(255, 243, 230, 0.4)',
    bg: '#FFF8F0',
  },
  mint: {
    url: 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png',
    label: '薄荷',
    icon: '🌿',
    tint: 'rgba(230, 255, 245, 0.35)',
    bg: '#F0FFF8',
  },
  night: {
    url: 'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png',
    label: '夜色',
    icon: '🌙',
    tint: 'rgba(30, 20, 60, 0.15)',
    bg: '#1A1830',
  },
  classic: {
    url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
    label: '经典',
    icon: '🗺️',
    tint: undefined,
    bg: '#F5F3EE',
  },
};

export type MapStyleKey = keyof typeof MAP_STYLES;

const latLngToTile = (lat: number, lng: number, zoom: number) => {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
  return { x, y };
};

const latLngToPixel = (
  lat: number, lng: number, zoom: number,
  originTileX: number, originTileY: number, tileDisplaySize: number
) => {
  const totalTiles = Math.pow(2, zoom);
  const scale = tileDisplaySize / TILE_SIZE;
  const pixelX = ((lng + 180) / 360) * totalTiles * TILE_SIZE * scale;
  const latRad = (lat * Math.PI) / 180;
  const pixelY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * totalTiles * TILE_SIZE * scale;
  return { x: pixelX - originTileX * TILE_SIZE * scale, y: pixelY - originTileY * TILE_SIZE * scale };
};

interface MarkerData {
  latitude: number; longitude: number; emoji: string;
  id: string; moodColor: string; count?: number;
}

interface Props {
  location: UserLocation;
  markers?: MarkerData[];
  onMarkerPress?: (id: string) => void;
  height?: number;
  zoom?: number;
  mapStyle?: MapStyleKey;
}

export const TileMap: React.FC<Props> = ({
  location, markers = [], onMarkerPress,
  height = SCREEN_HEIGHT, zoom: initialZoom = 17, mapStyle = 'soft',
}) => {
  const style = MAP_STYLES[mapStyle] || MAP_STYLES.soft;
  const isDark = mapStyle === 'night';
  const GRID = 5;
  const EXTRA = 2;
  const tileDisplaySize = SCREEN_WIDTH / GRID;

  const [zoom, setZoom] = useState(initialZoom);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [offsetState, setOffsetState] = useState({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderMove: (_, gs) => {
        setOffsetState({ x: offsetRef.current.x + gs.dx, y: offsetRef.current.y + gs.dy });
      },
      onPanResponderRelease: (_, gs) => {
        offsetRef.current = { x: offsetRef.current.x + gs.dx, y: offsetRef.current.y + gs.dy };
      },
    })
  ).current;

  const recenter = () => { offsetRef.current = { x: 0, y: 0 }; setOffsetState({ x: 0, y: 0 }); setZoom(initialZoom); };
  const zoomIn = () => setZoom((z) => Math.min(z + 1, 18));
  const zoomOut = () => { setZoom((z) => Math.max(z - 1, 12)); offsetRef.current = { x: 0, y: 0 }; setOffsetState({ x: 0, y: 0 }); };

  const centerTile = useMemo(() => latLngToTile(location.latitude, location.longitude, zoom), [location, zoom]);
  const tiles = useMemo(() => {
    const result: { x: number; y: number; row: number; col: number }[] = [];
    const half = Math.floor(GRID / 2);
    for (let row = -EXTRA; row < GRID + EXTRA; row++)
      for (let col = -EXTRA; col < GRID + EXTRA; col++)
        result.push({ x: centerTile.x - half + col, y: centerTile.y - half + row, row, col });
    return result;
  }, [centerTile]);

  const originTileX = centerTile.x - Math.floor(GRID / 2) - EXTRA;
  const originTileY = centerTile.y - Math.floor(GRID / 2) - EXTRA;
  const userPixel = useMemo(() => latLngToPixel(location.latitude, location.longitude, zoom, originTileX, originTileY, tileDisplaySize), [location, zoom, originTileX, originTileY, tileDisplaySize]);
  const markerPositions = useMemo(() => markers.map((m) => ({ ...m, ...latLngToPixel(m.latitude, m.longitude, zoom, originTileX, originTileY, tileDisplaySize) })), [markers, zoom, originTileX, originTileY, tileDisplaySize]);

  const totalGridW = (GRID + EXTRA * 2) * tileDisplaySize;
  const baseLeft = (SCREEN_WIDTH - totalGridW) / 2;
  const baseTop = (height - totalGridW) / 2;

  return (
    <View style={[s.container, { height, backgroundColor: style.bg }]} {...panResponder.panHandlers}>
      <View style={{ position: 'absolute', width: totalGridW, height: totalGridW, left: baseLeft + offsetState.x, top: baseTop + offsetState.y }}>
        {tiles.map((tile) => (
          <Image
            key={`${zoom}-${tile.x}-${tile.y}-${mapStyle}`}
            source={{ uri: style.url.replace('{z}', String(zoom)).replace('{x}', String(tile.x)).replace('{y}', String(tile.y)) }}
            style={{ position: 'absolute', left: (tile.col + EXTRA) * tileDisplaySize, top: (tile.row + EXTRA) * tileDisplaySize, width: tileDisplaySize + 1, height: tileDisplaySize + 1, opacity: isDark ? 1 : 0.6 }}
            resizeMode="cover"
          />
        ))}

        {/* 颜色叠加 — 统一色调 */}
        {style.tint ? <View style={{ position: 'absolute', top: 0, left: 0, width: totalGridW, height: totalGridW, backgroundColor: style.tint, zIndex: 1 }} pointerEvents="none" /> : null}

        {/* 路径连线 */}
        {markerPositions.length >= 2 && markerPositions.slice(0, -1).map((m, i) => {
          const next = markerPositions[i + 1];
          const dx = next.x - m.x; const dy = next.y - m.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 500) return null;
          return <View key={`p-${i}`} style={{ position: 'absolute', left: m.x, top: m.y - 1, width: len, height: 2, backgroundColor: isDark ? 'rgba(155,143,255,0.35)' : 'rgba(124,108,240,0.2)', transform: [{ rotate: `${Math.atan2(dy, dx) * 180 / Math.PI}deg` }], transformOrigin: 'left center', zIndex: 3, borderRadius: 1 }} />;
        })}

        {/* 心情气泡标记 */}
        {markerPositions.map((m) => (
          <TouchableOpacity key={m.id} style={[s.marker, { left: m.x - 24, top: m.y - 28 }]} onPress={() => onMarkerPress?.(m.id)} activeOpacity={0.8}>
            <View style={[s.bubble, { backgroundColor: m.moodColor + '18', borderColor: m.moodColor + '40' }]}>
              <Text style={s.bubbleEmoji}>{m.emoji}</Text>
            </View>
            <View style={[s.bubbleTail, { borderTopColor: m.moodColor + '18' }]} />
            {m.count && m.count > 1 ? <View style={s.badge}><Text style={s.badgeText}>{m.count}</Text></View> : null}
          </TouchableOpacity>
        ))}

        {/* 用户位置 */}
        <View style={[s.userRing, { left: userPixel.x - 18, top: userPixel.y - 18 }]} />
        <View style={[s.userDot, { left: userPixel.x - 6, top: userPixel.y - 6 }]} />
      </View>

      {/* 控制按钮 */}
      <View style={s.ctrls}>
        <TouchableOpacity style={[s.ctrl, isDark ? s.ctrlD : undefined]} onPress={zoomIn}><Text style={[s.ctrlT, isDark ? s.ctrlTD : undefined]}>+</Text></TouchableOpacity>
        <TouchableOpacity style={[s.ctrl, isDark ? s.ctrlD : undefined]} onPress={zoomOut}><Text style={[s.ctrlT, isDark ? s.ctrlTD : undefined]}>−</Text></TouchableOpacity>
        <View style={{ height: 10 }} />
        <TouchableOpacity style={[s.ctrl, isDark ? s.ctrlD : undefined]} onPress={recenter}>
          <View style={s.locI}><View style={s.locD} /></View>
        </TouchableOpacity>
      </View>

      <Text style={[s.attr, isDark ? { color: 'rgba(255,255,255,0.2)' } : undefined]}>© OSM © CARTO</Text>
    </View>
  );
};

const s = StyleSheet.create({
  container: { overflow: 'hidden' },
  marker: { position: 'absolute', alignItems: 'center', zIndex: 10 },
  bubble: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, shadowColor: '#7C6CF0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
  bubbleEmoji: { fontSize: 24 },
  bubbleTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  badge: { position: 'absolute', top: -3, right: -3, backgroundColor: '#FF7EB3', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, borderWidth: 2, borderColor: '#FFF' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  userRing: { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(124,108,240,0.25)', backgroundColor: 'rgba(124,108,240,0.05)', zIndex: 19 },
  userDot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#7C6CF0', borderWidth: 2, borderColor: '#FFF', zIndex: 20, shadowColor: '#7C6CF0', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
  ctrls: { position: 'absolute', right: 14, top: 100 },
  ctrl: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.85)', justifyContent: 'center', alignItems: 'center', marginBottom: 5, shadowColor: '#7C6CF0', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  ctrlD: { backgroundColor: 'rgba(40,38,60,0.8)' },
  ctrlT: { fontSize: 18, fontWeight: '300', color: '#2D2B3D' },
  ctrlTD: { color: '#E0DEF0' },
  locI: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#7C6CF0', justifyContent: 'center', alignItems: 'center' },
  locD: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#7C6CF0' },
  attr: { position: 'absolute', bottom: 4, left: 8, fontSize: 8, color: 'rgba(0,0,0,0.15)' },
});
