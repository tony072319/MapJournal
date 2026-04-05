import React, { useMemo, useState, useRef } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { UserLocation } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TILE_SIZE = 256;

// 更美观的地图瓦片源 — CartoDB Voyager（干净、现代、彩色）
const TILE_URL = 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png';

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
}

export const TileMap: React.FC<Props> = ({
  location,
  markers = [],
  onMarkerPress,
  height = SCREEN_HEIGHT,
  zoom: initialZoom = 16,
}) => {
  const GRID = 5;
  const EXTRA = 2;
  const tileDisplaySize = SCREEN_WIDTH / GRID;

  const [zoom, setZoom] = useState(initialZoom);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const lastOffset = useRef({ x: 0, y: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dx) > 3 || Math.abs(gs.dy) > 3,
        onPanResponderGrant: () => {
          lastOffset.current = { ...offset };
        },
        onPanResponderMove: (_, gs) => {
          setOffset({
            x: lastOffset.current.x + gs.dx,
            y: lastOffset.current.y + gs.dy,
          });
        },
      }),
    [offset]
  );

  const recenter = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(initialZoom);
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 1, 18));
  const zoomOut = () => setZoom((z) => Math.max(z - 1, 10));

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
  }, [centerTile, GRID]);

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

  const totalGridW = (GRID + EXTRA * 2) * tileDisplaySize;
  const totalGridH = totalGridW;

  // 瓦片层居中偏移
  const baseLeft = (SCREEN_WIDTH - totalGridW) / 2;
  const baseTop = (height - totalGridH) / 2;

  return (
    <View style={[styles.container, { height }]} {...panResponder.panHandlers}>
      {/* 瓦片层 */}
      <View
        style={{
          position: 'absolute',
          width: totalGridW,
          height: totalGridH,
          left: baseLeft + offset.x,
          top: baseTop + offset.y,
        }}
      >
        {tiles.map((tile) => (
          <Image
            key={`${zoom}-${tile.x}-${tile.y}`}
            source={{
              uri: TILE_URL.replace('{z}', String(zoom)).replace('{x}', String(tile.x)).replace('{y}', String(tile.y)),
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

        {/* 心情路径连线 — Polarsteps 风格 */}
        {markerPositions.length >= 2 &&
          markerPositions.slice(0, -1).map((m, i) => {
            const next = markerPositions[i + 1];
            const dx = next.px - m.px;
            const dy = next.py - m.py;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            if (length > 500) return null; // 太远的不连
            return (
              <View
                key={`path-${i}`}
                style={{
                  position: 'absolute',
                  left: m.px,
                  top: m.py - 1,
                  width: length,
                  height: 2,
                  backgroundColor: Colors.primary + '25',
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: 'left center',
                  zIndex: 1,
                  borderRadius: 1,
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
                left: m.px - 20,
                top: m.py - 20,
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

        {/* 用户位置蓝点 */}
        <View style={[styles.userPulse, { left: userPixel.x - 16, top: userPixel.y - 16 }]} />
        <View style={[styles.userDot, { left: userPixel.x - 8, top: userPixel.y - 8 }]} />
      </View>

      {/* 缩放 + 定位按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={zoomIn} activeOpacity={0.7}>
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={zoomOut} activeOpacity={0.7}>
          <Text style={styles.controlText}>−</Text>
        </TouchableOpacity>
        <View style={styles.controlSpacer} />
        <TouchableOpacity style={styles.controlBtn} onPress={recenter} activeOpacity={0.7}>
          <View style={styles.recenterIcon}>
            <View style={styles.recenterDot} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 归属 */}
      <Text style={styles.attribution}>© OpenStreetMap © CARTO</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F2EFE9',
  },
  // 用户位置
  userPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    zIndex: 19,
  },
  userDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  // 标记
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  markerEmoji: {
    fontSize: 20,
  },
  markerCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // 控制按钮
  controls: {
    position: 'absolute',
    right: 16,
    top: 100,
    alignItems: 'center',
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  controlText: {
    fontSize: 22,
    fontWeight: '300',
    color: '#1C1917',
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
    borderColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recenterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366F1',
  },
  attribution: {
    position: 'absolute',
    bottom: 6,
    left: 10,
    fontSize: 9,
    color: 'rgba(0,0,0,0.3)',
  },
});
