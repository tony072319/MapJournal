import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { MAPBOX_TOKEN, ILLUSTRATED_STYLE } from '../constants/mapbox';
import { Colors, MoodColors } from '../constants/colors';
import { UserLocation, MoodType } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 初始化 Mapbox
Mapbox.setAccessToken(MAPBOX_TOKEN);

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

export const MapboxMapView: React.FC<Props> = ({
  location,
  markers = [],
  onMarkerPress,
  height = SCREEN_HEIGHT,
}) => {
  const cameraRef = useRef<Mapbox.Camera>(null);

  const recenter = useCallback(() => {
    cameraRef.current?.setCamera({
      centerCoordinate: [location.longitude, location.latitude],
      zoomLevel: 16,
      animationDuration: 500,
    });
  }, [location]);

  return (
    <View style={[styles.container, { height }]}>
      <Mapbox.MapView
        style={styles.map}
        styleJSON={JSON.stringify(ILLUSTRATED_STYLE)}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        compassEnabled={false}
      >
        <Mapbox.Camera
          ref={cameraRef}
          centerCoordinate={[location.longitude, location.latitude]}
          zoomLevel={16}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* 用户位置 */}
        <Mapbox.LocationPuck
          puckBearing="heading"
          puckBearingEnabled
          pulsing={{ isEnabled: true, color: '#7C6CF0', radius: 40 }}
        />

        {/* 心情标记 */}
        {markers.map((m) => (
          <Mapbox.PointAnnotation
            key={m.id}
            id={m.id}
            coordinate={[m.longitude, m.latitude]}
            onSelected={() => onMarkerPress?.(m.id)}
          >
            <View style={[styles.marker, { borderColor: m.moodColor + '60' }]}>
              <View style={[styles.markerInner, { backgroundColor: m.moodColor + '15' }]}>
                <Text style={styles.markerEmoji}>{m.emoji}</Text>
              </View>
              {m.count && m.count > 1 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{m.count}</Text>
                </View>
              ) : null}
            </View>
            <Mapbox.Callout title="" />
          </Mapbox.PointAnnotation>
        ))}
      </Mapbox.MapView>

      {/* 控制按钮 */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => {
          cameraRef.current?.setCamera({
            zoomLevel: 17,
            animationDuration: 300,
          });
        }}>
          <Text style={styles.ctrlText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn} onPress={() => {
          cameraRef.current?.setCamera({
            zoomLevel: 14,
            animationDuration: 300,
          });
        }}>
          <Text style={styles.ctrlText}>−</Text>
        </TouchableOpacity>
        <View style={{ height: 10 }} />
        <TouchableOpacity style={styles.ctrlBtn} onPress={recenter}>
          <View style={styles.locIcon}>
            <View style={styles.locDot} />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.attr}>© Mapbox © OpenStreetMap</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { overflow: 'hidden' },
  map: { flex: 1 },
  marker: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 26,
    padding: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#7C6CF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  markerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerEmoji: { fontSize: 24 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF7EB3',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#FFF' },
  controls: { position: 'absolute', right: 14, top: 100 },
  ctrlBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#7C6CF0',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  ctrlText: { fontSize: 18, fontWeight: '300', color: '#2D2B3D' },
  locIcon: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 1.5, borderColor: '#7C6CF0',
    justifyContent: 'center', alignItems: 'center',
  },
  locDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#7C6CF0' },
  attr: { position: 'absolute', bottom: 4, left: 8, fontSize: 8, color: 'rgba(0,0,0,0.15)' },
});
