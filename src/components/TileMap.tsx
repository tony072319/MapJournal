import React, { useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions, Text } from 'react-native';
import { Colors } from '../constants/colors';
import { UserLocation } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_SIZE = 256;
const ZOOM = 15;

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

// 瓦片坐标 → 经纬度（瓦片左上角）
const tileToLatLng = (x: number, y: number, zoom: number) => {
  const lng = (x / Math.pow(2, zoom)) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom);
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
};

// 经纬度 → 像素偏移（相对于瓦片网格左上角）
const latLngToPixelOffset = (
  lat: number,
  lng: number,
  centerTileX: number,
  centerTileY: number,
  zoom: number,
  gridSize: number
) => {
  const totalTiles = Math.pow(2, zoom);
  // 全球像素坐标
  const pixelX = ((lng + 180) / 360) * totalTiles * TILE_SIZE;
  const latRad = (lat * Math.PI) / 180;
  const pixelY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    totalTiles *
    TILE_SIZE;

  // 网格左上角瓦片的像素坐标
  const startTileX = centerTileX - Math.floor(gridSize / 2);
  const startTileY = centerTileY - Math.floor(gridSize / 2);
  const gridOriginX = startTileX * TILE_SIZE;
  const gridOriginY = startTileY * TILE_SIZE;

  return {
    x: pixelX - gridOriginX,
    y: pixelY - gridOriginY,
  };
};

interface MarkerData {
  latitude: number;
  longitude: number;
  emoji: string;
  id: string;
}

interface Props {
  location: UserLocation;
  markers?: MarkerData[];
  onMarkerPress?: (id: string) => void;
  height?: number;
}

export const TileMap: React.FC<Props> = ({
  location,
  markers = [],
  onMarkerPress,
  height = 300,
}) => {
  const GRID = 3; // 3x3 瓦片网格
  const tileDisplaySize = SCREEN_WIDTH / GRID;
  const scale = tileDisplaySize / TILE_SIZE;

  const centerTile = useMemo(
    () => latLngToTile(location.latitude, location.longitude, ZOOM),
    [location]
  );

  // 生成瓦片网格
  const tiles = useMemo(() => {
    const result: { x: number; y: number; row: number; col: number }[] = [];
    const half = Math.floor(GRID / 2);
    for (let row = 0; row < GRID; row++) {
      for (let col = 0; col < GRID; col++) {
        result.push({
          x: centerTile.x - half + col,
          y: centerTile.y - half + row,
          row,
          col,
        });
      }
    }
    return result;
  }, [centerTile]);

  // 标记位置计算
  const markerPositions = useMemo(() => {
    return markers.map((m) => {
      const pixel = latLngToPixelOffset(
        m.latitude,
        m.longitude,
        centerTile.x,
        centerTile.y,
        ZOOM,
        GRID
      );
      return {
        ...m,
        px: pixel.x * scale,
        py: pixel.y * scale,
      };
    });
  }, [markers, centerTile, scale]);

  return (
    <View style={[styles.container, { height }]}>
      {/* 瓦片网格 */}
      <View style={[styles.tileGrid, { width: SCREEN_WIDTH, height: SCREEN_WIDTH }]}>
        {tiles.map((tile) => (
          <Image
            key={`${tile.x}-${tile.y}`}
            source={{
              uri: `https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png`,
              headers: { 'User-Agent': 'MapJournal/1.0' },
            }}
            style={{
              position: 'absolute',
              left: tile.col * tileDisplaySize,
              top: tile.row * tileDisplaySize,
              width: tileDisplaySize,
              height: tileDisplaySize,
            }}
            resizeMode="cover"
          />
        ))}

        {/* 用户位置蓝点 */}
        <View
          style={[
            styles.userDot,
            {
              left: SCREEN_WIDTH / 2 - 8,
              top: SCREEN_WIDTH / 2 - 8,
            },
          ]}
        >
          <View style={styles.userDotInner} />
        </View>

        {/* 心情标记 */}
        {markerPositions.map((m) => {
          // 只显示在可见区域内的标记
          if (m.px < -20 || m.px > SCREEN_WIDTH + 20 || m.py < -20 || m.py > SCREEN_WIDTH + 20) {
            return null;
          }
          return (
            <View
              key={m.id}
              style={[
                styles.marker,
                { left: m.px - 16, top: m.py - 16 },
              ]}
            >
              <Text style={styles.markerEmoji}>{m.emoji}</Text>
            </View>
          );
        })}
      </View>

      {/* 底部渐变遮罩 */}
      <View style={styles.fadeBottom} />

      {/* OSM归属 */}
      <Text style={styles.attribution}>OpenStreetMap</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 0,
    backgroundColor: '#E8E0D8',
  },
  tileGrid: {
    position: 'relative',
  },
  userDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  userDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  marker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 5,
  },
  markerEmoji: {
    fontSize: 18,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(250, 250, 249, 0.8)',
  },
  attribution: {
    position: 'absolute',
    bottom: 4,
    right: 8,
    fontSize: 9,
    color: 'rgba(0,0,0,0.3)',
  },
});
