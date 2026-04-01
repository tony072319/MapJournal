import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { darkMapStyle } from '../constants/mapStyles';
import { MoodMarker } from '../components/MoodMarker';
import { NewEntrySheet } from '../components/NewEntrySheet';
import { EntryDetail } from '../components/EntryDetail';
import { MapStylePicker } from '../components/MapStylePicker';
import { Entry, MapStyleType, MoodType } from '../types';

export const MapScreen: React.FC = () => {
  const { location, loading, error } = useLocation();
  const { entries } = useEntries();
  const mapRef = useRef<MapView>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleType>('standard');

  const handleAddPress = useCallback(() => {
    setShowNewEntry(true);
  }, []);

  const handleMarkerPress = useCallback((entry: Entry) => {
    setSelectedEntry(entry);
  }, []);

  const handleRecenter = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  }, [location]);

  // 加载中
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>正在获取位置...</Text>
      </View>
    );
  }

  // 定位失败
  if (error || !location) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>📍</Text>
        <Text style={styles.errorText}>{error || '无法获取位置'}</Text>
        <Text style={styles.errorHint}>请在设置中允许App访问位置信息</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        mapType={mapStyle === 'satellite' ? 'satellite' : 'standard'}
        customMapStyle={mapStyle === 'dark' ? darkMapStyle : undefined}
      >
        {entries.map((entry) => (
          <Marker
            key={entry.id}
            coordinate={{
              latitude: entry.latitude,
              longitude: entry.longitude,
            }}
            onPress={() => handleMarkerPress(entry)}
          >
            <MoodMarker mood={entry.mood as MoodType} emoji={entry.emoji} />
          </Marker>
        ))}
      </MapView>

      {/* 地图风格切换按钮 */}
      <MapStylePicker
        currentStyle={mapStyle}
        onStyleChange={setMapStyle}
      />

      {/* 重新定位按钮 */}
      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
        <Text style={styles.recenterIcon}>📍</Text>
      </TouchableOpacity>

      {/* 添加心情按钮 */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* 新建心情面板 */}
      <NewEntrySheet
        visible={showNewEntry}
        onClose={() => setShowNewEntry(false)}
        location={location}
      />

      {/* 心情详情弹窗 */}
      <EntryDetail
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorHint: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  recenterIcon: {
    fontSize: 20,
  },
});
