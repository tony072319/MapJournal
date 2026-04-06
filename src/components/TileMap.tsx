import React, { useMemo, useState, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { UserLocation } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TILE_SIZE = 256;

// 地图风格
export const MAP_STYLES = {
  illustrated: {
    url: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
    label: '插画',
    icon: '🎨',
    overlay: true, // 叠加插画层
  },
  voyager: {
    url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
    label: '彩色',
    icon: '🗺️',
    overlay: false,
  },
  dark: {
    url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
    label: '夜景',
    icon: '🌙',
    overlay: false,
  },
  topo: {
    url: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
    label: '地形',
    icon: '⛰️',
    overlay: false,
  },
  minimal: {
    url: 'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png',
    label: '极简',
    icon: '⬜',
    overlay: false,
  },
};

export type MapStyleKey = keyof typeof MAP_STYLES;

const latLngToTile = (lat: number, lng: number, zoom: number) => {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
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
  const pixelY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    totalTiles * TILE_SIZE * scale;
  return {
    x: pixelX - originTileX * TILE_SIZE * scale,
    y: pixelY - originTileY * TILE_SIZE * scale,
  };
};

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
  zoom?: number;
  mapStyle?: MapStyleKey;
}

// 装饰性元素 — 根据位置伪随机生成
const DECORATIONS = ['🌳', '🌲', '🌿', '🏠', '☁️', '🌸', '🍃', '🏡', '🌾', '⛅'];

const getDecoration = (x: number, y: number): { emoji: string; size: number; opacity: number } | null => {
  // 用坐标做伪随机，约1/8的位置有装饰
  const hash = ((x * 7919 + y * 104729) % 100);
  if (hash > 12) return null;
  const idx = (x * 31 + y * 17) % DECORATIONS.length;
  const size = 14 + (hash % 8);
  const opacity = 0.3 + (hash % 4) * 0.1;
  return { emoji: DECORATIONS[idx], size, opacity };
};

export const TileMap: React.FC<Props> = ({
  location,
  markers = [],
  onMarkerPress,
  height = SCREEN_HEIGHT,
  zoom: initialZoom = 17,
  mapStyle = 'illustrated',
}) => {
  const styleConfig = MAP_STYLES[mapStyle] || MAP_STYLES.illustrated;
  const tileUrl = styleConfig.url;
  const showOverlay = styleConfig.overlay;

  const GRID = 5;
  const EXTRA = 2;
  const tileDisplaySize = SCREEN_WIDTH / GRID;

  const [zoom, setZoom] = useState(initialZoom);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [offsetState, setOffsetState] = useState({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
      onPanResponderMove: (_, gs) => {
        setOffsetState({
          x: offsetRef.current.x + gs.dx,
          y: offsetRef.current.y + gs.dy,
        });
      },
      onPanResponderRelease: (_, gs) => {
        offsetRef.current = {
          x: offsetRef.current.x + gs.dx,
          y: offsetRef.current.y + gs.dy,
        };
      },
    })
  ).current;

  const recenter = () => {
    offsetRef.current = { x: 0, y: 0 };
    setOffsetState({ x: 0, y: 0 });
    setZoom(initialZoom);
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 1, 18));
  const zoomOut = () => {
    setZoom((z) => Math.max(z - 1, 12));
    offsetRef.current = { x: 0, y: 0 };
    setOffsetState({ x: 0, y: 0 });
  };

  const centerTile = useMemo(
    () => latLngToTile(location.latitude, location.longitude, zoom),
    [location, zoom]
  );

  const tiles = useMemo(() => {
    const result: { x: number; y: number; row: number; col: number }[] = [];
    const half = Math.floor(GRID / 2);
    for (let row = -EXTRA; row < GRID + EXTRA; row++) {
      for (let col = -EXTRA; col < GRID + EXTRA; col++) {
        result.push({
          x: centerTile.x - half + col,
          y: centerTile.y - half + row,
          row, col,
        });
      }
    }
    return result;
  }, [centerTile]);

  const originTileX = centerTile.x - Math.floor(GRID / 2) - EXTRA;
  const originTileY = centerTile.y - Math.floor(GRID / 2) - EXTRA;

  const userPixel = useMemo(
    () => latLngToPixel(location.latitude, location.longitude, zoom, originTileX, originTileY, tileDisplaySize),
    [location, zoom, originTileX, originTileY, tileDisplaySize]
  );

  const markerPositions = useMemo(() => {
    return markers.map((m) => {
      const p = latLngToPixel(m.latitude, m.longitude, zoom, originTileX, originTileY, tileDisplaySize);
      return { ...m, px: p.x, py: p.y };
    });
  }, [markers, zoom, originTileX, originTileY, tileDisplaySize]);

  // 装饰元素位置
  const decorations = useMemo(() => {
    if (!showOverlay) return [];
    const decors: { x: number; y: number; emoji: string; size: number; opacity: number }[] = [];
    const half = Math.floor(GRID / 2);
    for (let row = -1; row < GRID + 1; row++) {
      for (let col = -1; col < GRID + 1; col++) {
        const tileX = centerTile.x - half + col;
        const tileY = centerTile.y - half + row;
        // 每个瓦片内生成几个装饰
        for (let i = 0; i < 3; i++) {
          const subHash = (tileX * 31 + tileY * 17 + i * 7) % 100;
          const dec = getDecoration(tileX + i * 13, tileY + i * 7);
          if (dec) {
            const px = (col + EXTRA) * tileDisplaySize + (subHash / 100) * tileDisplaySize;
            const py = (row + EXTRA) * tileDisplaySize + ((subHash * 3 + 20) % 100) / 100 * tileDisplaySize;
            decors.push({ x: px, y: py, ...dec });
          }
        }
      }
    }
    return decors;
  }, [centerTile, showOverlay, tileDisplaySize]);

  const totalGridW = (GRID + EXTRA * 2) * tileDisplaySize;
  const baseLeft = (SCREEN_WIDTH - totalGridW) / 2;
  const baseTop = (height - totalGridW) / 2;

  const isDarkStyle = mapStyle === 'dark';

  return (
    <View style={[styles.container, { height, backgroundColor: isDarkStyle ? '#1a1a2e' : '#F8F6F0' }]} {...panResponder.panHandlers}>
      <View
        style={{
          position: 'absolute',
          width: totalGridW,
          height: totalGridW,
          left: baseLeft + offsetState.x,
          top: baseTop + offsetState.y,
        }}
      >
        {/* 瓦片底图 */}
        {tiles.map((tile) => (
          <Image
            key={`${zoom}-${tile.x}-${tile.y}-${mapStyle}`}
            source={{
              uri: tileUrl.replace('{z}', String(zoom)).replace('{x}', String(tile.x)).replace('{y}', String(tile.y)),
            }}
            style={{
              position: 'absolute',
              left: (tile.col + EXTRA) * tileDisplaySize,
              top: (tile.row + EXTRA) * tileDisplaySize,
              width: tileDisplaySize + 1,
              height: tileDisplaySize + 1,
            }}
            resizeMode="cover"
          />
        ))}

        {/* 插画叠加层 — 纸张纹理 + 装饰元素 */}
        {showOverlay && (
          <>
            {/* 半透明暖色叠加 — 给底图一个"纸张感" */}
            <View style={styles.paperOverlay} />

            {/* 散布的装饰emoji */}
            {decorations.map((d, i) => (
              <Text
                key={`dec-${i}`}
                style={{
                  position: 'absolute',
                  left: d.x,
                  top: d.y,
                  fontSize: d.size,
                  opacity: d.opacity,
                  zIndex: 2,
                }}
              >
                {d.emoji}
              </Text>
            ))}
          </>
        )}

        {/* 心情路径连线 */}
        {markerPositions.length >= 2 &&
          markerPositions.slice(0, -1).map((m, i) => {
            const next = markerPositions[i + 1];
            const dx = next.px - m.px;
            const dy = next.py - m.py;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (length > 500) return null;
            return (
              <View
                key={`path-${i}`}
                style={{
                  position: 'absolute',
                  left: m.px,
                  top: m.py - 1,
                  width: length,
                  height: 3,
                  backgroundColor: isDarkStyle ? 'rgba(155,143,255,0.3)' : 'rgba(124,108,240,0.2)',
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: 'left center',
                  zIndex: 3,
                  borderRadius: 1.5,
                }}
              />
            );
          })}

        {/* 心情标记 */}
        {markerPositions.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.marker,
              {
                left: m.px - 22,
                top: m.py - 22,
                borderColor: m.moodColor,
              },
            ]}
            onPress={() => onMarkerPress?.(m.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.markerEmoji}>{m.emoji}</Text>
            {m.count && m.count > 1 ? (
              <View style={styles.markerCountBadge}>
                <Text style={styles.markerCountText}>{m.count}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}

        {/* 用户位置 */}
        <View style={[styles.userPulse, { left: userPixel.x - 18, top: userPixel.y - 18 }]} />
        <View style={[styles.userDot, { left: userPixel.x - 9, top: userPixel.y - 9 }]} />
      </View>

      {/* 控制按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.controlBtn, isDarkStyle ? styles.controlBtnDark : undefined]} onPress={zoomIn} activeOpacity={0.7}>
          <Text style={[styles.controlText, isDarkStyle ? { color: '#FFF' } : undefined]}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, isDarkStyle ? styles.controlBtnDark : undefined]} onPress={zoomOut} activeOpacity={0.7}>
          <Text style={[styles.controlText, isDarkStyle ? { color: '#FFF' } : undefined]}>−</Text>
        </TouchableOpacity>
        <View style={styles.controlSpacer} />
        <TouchableOpacity style={[styles.controlBtn, isDarkStyle ? styles.controlBtnDark : undefined]} onPress={recenter} activeOpacity={0.7}>
          <View style={styles.recenterIcon}>
            <View style={styles.recenterDot} />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.attribution, isDarkStyle ? { color: 'rgba(255,255,255,0.3)' } : undefined]}>
        © OpenStreetMap © CARTO
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  // 纸张纹理叠加
  paperOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(252, 248, 240, 0.25)',
    zIndex: 1,
  },
  // 用户位置
  userPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 108, 240, 0.15)',
    zIndex: 19,
  },
  userDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#7C6CF0',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 20,
    shadowColor: '#7C6CF0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  // 标记
  marker: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C6CF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  markerEmoji: {
    fontSize: 20,
  },
  markerCountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF7EB3',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // 控制
  controls: {
    position: 'absolute',
    right: 16,
    top: 100,
    alignItems: 'center',
  },
  controlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#7C6CF0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  controlBtnDark: {
    backgroundColor: 'rgba(50,48,70,0.9)',
  },
  controlText: {
    fontSize: 22,
    fontWeight: '300',
    color: '#2D2B3D',
    marginTop: -1,
  },
  controlSpacer: {
    height: 8,
  },
  recenterIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#7C6CF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7C6CF0',
  },
  attribution: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    fontSize: 9,
    color: 'rgba(0,0,0,0.25)',
  },
});
