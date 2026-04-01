import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { useEntries } from '../context/EntriesContext';
import { Colors } from '../constants/colors';
import { darkMapStyle } from '../constants/mapStyles';
import { MoodMarker } from '../components/MoodMarker';
import { NewEntrySheet } from '../components/NewEntrySheet';
import { EntryDetail } from '../components/EntryDetail';
import { MapStylePicker } from '../components/MapStylePicker';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { Entry, MapStyleType, MoodType } from '../types';
import AsyncStorage from '../utils/storage';

export const MapScreen: React.FC = () => {
  const { location, loading, error } = useLocation();
  const { entries } = useEntries();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleType>('standard');
  const [showWelcome, setShowWelcome] = useState(false);

  // 首次启动检测
  useEffect(() => {
    try {
      const hasLaunched = AsyncStorage.getItem('hasLaunched');
      if (!hasLaunched) {
        setShowWelcome(true);
      }
    } catch {
      // 静默失败
    }
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    try {
      AsyncStorage.setItem('hasLaunched', 'true');
    } catch {
      // 静默失败
    }
  };

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
        showsCompass={false}
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

      {/* 顶部状态栏背景渐变 */}
      <View style={[styles.statusBarOverlay, { height: insets.top + 10 }]} />

      {/* 顶部标题 */}
      <View style={[styles.titleContainer, { top: insets.top + 12 }]}>
        <View style={styles.titlePill}>
          <Text style={styles.titleText}>MapJournal</Text>
          {entries.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{entries.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 地图风格切换按钮 */}
      <View style={{ position: 'absolute', top: insets.top + 56, right: 16 }}>
        <MapStylePicker
          currentStyle={mapStyle}
          onStyleChange={setMapStyle}
        />
      </View>

      {/* 重新定位按钮 */}
      <TouchableOpacity
        style={[styles.recenterButton, { bottom: 110 }]}
        onPress={handleRecenter}
      >
        <Text style={styles.recenterIcon}>📍</Text>
      </TouchableOpacity>

      {/* 添加心情按钮 */}
      <TouchableOpacity
        style={[styles.addButton, { bottom: 40 }]}
        onPress={handleAddPress}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* 欢迎弹窗 */}
      {showWelcome && <WelcomeOverlay onGetStarted={handleWelcomeClose} />}

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
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(248, 249, 254, 0.85)',
  },
  titleContainer: {
    position: 'absolute',
    left: 16,
  },
  titlePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  countBadge: {
    marginLeft: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  addButtonText: {
    fontSize: 34,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  recenterIcon: {
    fontSize: 20,
  },
});
