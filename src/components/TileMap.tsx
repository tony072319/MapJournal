import React, { useMemo, useState, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, PanResponder } from 'react-native';
import { Colors } from '../constants/colors';
import { UserLocation } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TILE_SIZE = 256;

// 经纬度 → OSM瓦片坐标
const latLngToTile = (lat: number, lng: number, zoom: number) => {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
  return { x, y };
};

// 经纬度 → 像素偏移
const latLngToPixel = (
  lat: number,
  lng: number,
  zoom: number,
  originTileX: number,
  originTileY: number,
  tileDisplaySize: number
) => {
  const totalTiles = Math.pow(2, zoom);
  const scale = tileDisplaySize / TILE_SIZE;
  const pixelX = ((lng + 180) / 360) * totalTiles * TILE_SIZE * scale;
  const latRad = (lat * Math.PI) / 180;
  const pixelY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    totalTiles * TILE_SIZE * scale;

  const gridOriginX = originTileX * TILE_SIZE * scale;
  const gridOriginY = originTileY * TILE_SIZE * scale;

  return { x: pixelX - gridOriginX, y: pixelY - gridOriginY };
};

interface MarkerData {
  latitude: number;
  longitude: number;
  emoji: string;
  id: string;
  moodColor: string;
}

interface Props {
  location: UserLocation;
  markers?: MarkerData[];
  onMarkerPress?: (id: string) => void;
  fullscreen?: boolean;
  zoom?: number;
}

export const TileMap: React.FC<Props> = ({
  location,
  markers = [],
  onMarkerPress,
  fullscreen = false,
  zoom = 15,
}) => {
  const mapHeight = fullscreen ? SCREEN_HEIGHT : 300;
  const GRID = fullscreen ? 5 : 3;
  const tileDisplaySize = SCREEN_WIDTH / GRID;

  // 拖拽偏移状态
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gs) =>
          Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
        onPanResponderMove: (_, gs) => {
          setPanOffset((prev) => ({
            x: prev.x + gs.dx * 0.3,
            y: prev.y + gs.dy * 0.3,
          }));
        },
        onPanResponderRelease: () => {},
      }),
    []
  );

  const centerTile = useMemo(
    () => latLngToTile(location.latitude, location.longitude, zoom),
    [location, zoom]
  );

  // 生成瓦片网格 (扩大一圈以覆盖拖拽)
  const EXTRA = 1;
  const tiles = useMemo(() => {
    const result: { x: number; y: number; row: number; col: number }[] = [];
    const half = Math.floor(GRID / 2);
    for (let row = -EXTRA; row < GRID + EXTRA; row++) {
      for (let col = -EXTRA; col < GRID + EXTRA; col++) {
        result.push({
          x: centerTile.x - half + col,
          y: centerTile.y - half + row,
          row,
          col,
        });
      }
    }
    return result;
  }, [centerTile, GRID]);

  const originTileX = centerTile.x - Math.floor(GRID / 2);
  const originTileY = centerTile.y - Math.floor(GRID / 2);

  // 用户位置像素
  const userPixel = useMemo(
    () => latLngToPixel(location.latitude, location.longitude, zoom, originTileX, originTileY, tileDisplaySize),
    [location, zoom, originTileX, originTileY, tileDisplaySize]
  );

  // 标记像素位置
  const markerPositions = useMemo(() => {
    return markers.map((m) => {
      const pixel = latLngToPixel(m.latitude, m.longitude, zoom, originTileX, originTileY, tileDisplaySize);
      return { ...m, px: pixel.x, py: pixel.y };
    });
  }, [markers, zoom, originTileX, originTileY, tileDisplaySize]);

  return (
    <View style={[styles.container, { height: mapHeight }]} {...panResponder.panHandlers}>
      {/* 瓦片层 */}
      <View
        style={[
          styles.tileLayer,
          {
            width: (GRID + EXTRA * 2) * tileDisplaySize,
            height: (GRID + EXTRA * 2) * tileDisplaySize,
            left: -EXTRA * tileDisplaySize + panOffset.x,
            top: -EXTRA * tileDisplaySize + panOffset.y,
          },
        ]}
      >
        {tiles.map((tile) => (
          <Image
            key={`${tile.x}-${tile.y}`}
            source={{
              uri: `https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`,
              headers: { 'User-Agent': 'MapJournal/1.0' },
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

        {/* 心情标记 */}
        {markerPositions.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.marker,
              {
                left: m.px + EXTRA * tileDisplaySize - 18,
                top: m.py + EXTRA * tileDisplaySize - 18,
                borderColor: m.moodColor,
              },
            ]}
            onPress={() => onMarkerPress?.(m.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.markerEmoji}>{m.emoji}</Text>
          </TouchableOpacity>
        ))}

        {/* 用户位置蓝点 */}
        <View
          style={[
            styles.userDotOuter,
            {
              left: userPixel.x + EXTRA * tileDisplaySize - 12,
              top: userPixel.y + EXTRA * tileDisplaySize - 12,
            },
          ]}
        >
          <View style={styles.userDotInner} />
        </View>
      </View>

      {/* OSM归属 */}
      <Text style={styles.attribution}>© OpenStreetMap</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E8E4DF',
  },
  tileLayer: {
    position: 'absolute',
  },
  userDotOuter: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  userDotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6366F1',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  marker: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 10,
  },
  markerEmoji: {
    fontSize: 18,
  },
  attribution: {
    position: 'absolute',
    bottom: 6,
    right: 10,
    fontSize: 9,
    color: 'rgba(0,0,0,0.35)',
  },
});
