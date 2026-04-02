import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation } from '../hooks/useLocation';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { NewEntrySheet } from '../components/NewEntrySheet';
import { EntryDetail } from '../components/EntryDetail';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { MoodFilter } from '../components/MoodFilter';
import { Entry, MapStyleType, MoodType } from '../types';
import { formatRelative } from '../utils/dateFormat';
import AsyncStorage from '../utils/storage';

// 尝试加载 react-native-maps（在Expo Go中可能不可用）
let MapView: any = null;
let Marker: any = null;
let MoodMarker: any = null;
let MapStylePicker: any = null;

try {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  MoodMarker = require('../components/MoodMarker').MoodMarker;
  MapStylePicker = require('../components/MapStylePicker').MapStylePicker;
} catch {
  // react-native-maps 不可用（Expo Go环境）
}

export const MapScreen: React.FC = () => {
  const { location, loading, error } = useLocation();
  const { entries } = useEntries();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<any>(null);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleType>('standard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [moodFilters, setMoodFilters] = useState<MoodType[]>([]);
  const [mapAvailable] = useState(MapView !== null);

  // 根据筛选过滤标记
  const filteredEntries = moodFilters.length === 0
    ? entries
    : entries.filter((e) => moodFilters.includes(e.mood as MoodType));

  const handleToggleMoodFilter = useCallback((mood: MoodType) => {
    setMoodFilters((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  }, []);

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
      {/* 地图区域 - 原生地图或备用视图 */}
      {mapAvailable ? (
        <MapView
          ref={mapRef}
          style={styles.map}
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
        >
          {filteredEntries.map((entry) => (
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
      ) : (
        /* Expo Go 备用视图 - 美观的心情列表卡片 */
        <View style={styles.fallbackMap}>
          <View style={[styles.fallbackHeader, { paddingTop: insets.top + 12 }]}>
            <Text style={styles.fallbackTitle}>MapJournal</Text>
            <Text style={styles.fallbackCoords}>
              📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>

          {entries.length > 0 && (
            <MoodFilter
              activeFilters={moodFilters}
              onToggle={handleToggleMoodFilter}
              onClear={() => setMoodFilters([])}
            />
          )}

          <ScrollView
            style={styles.fallbackScroll}
            contentContainerStyle={styles.fallbackContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredEntries.length === 0 && entries.length === 0 && (
              <View style={styles.fallbackEmpty}>
                <Text style={styles.fallbackEmptyEmoji}>🗺️</Text>
                <Text style={styles.fallbackEmptyTitle}>你的心情地图</Text>
                <Text style={styles.fallbackEmptyHint}>
                  点击下方 "+" 按钮{'\n'}记录你的第一条心情
                </Text>
                <View style={styles.fallbackNote}>
                  <Text style={styles.fallbackNoteText}>
                    提示：完整的地图功能需要构建开发版本{'\n'}
                    目前在 Expo Go 中使用列表视图
                  </Text>
                </View>
              </View>
            )}

            {filteredEntries.length === 0 && entries.length > 0 && (
              <View style={styles.fallbackEmpty}>
                <Text style={styles.fallbackEmptyEmoji}>🔍</Text>
                <Text style={styles.fallbackEmptyHint}>没有匹配的心情记录</Text>
              </View>
            )}

            {/* 心情标记网格 */}
            <View style={styles.markerGrid}>
              {filteredEntries.map((entry) => {
                const mood = getMoodByType(entry.mood);
                const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;
                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={[styles.markerCard, { borderLeftColor: moodColor }]}
                    onPress={() => handleMarkerPress(entry)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.markerCardRow}>
                      <View style={[styles.markerEmojiCircle, { backgroundColor: moodColor + '15', borderColor: moodColor }]}>
                        <Text style={styles.markerEmoji}>{entry.emoji}</Text>
                      </View>
                      <View style={styles.markerCardContent}>
                        <Text style={[styles.markerMoodLabel, { color: moodColor }]}>{mood.label}</Text>
                        {entry.note && (
                          <Text style={styles.markerNote} numberOfLines={1}>{entry.note}</Text>
                        )}
                        <Text style={styles.markerMeta}>
                          {formatRelative(entry.createdAt)}
                          {entry.address ? ` · ${entry.address}` : ''}
                        </Text>
                      </View>
                      {entry.photoUri && <Text style={styles.markerPhotoIcon}>📷</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 原生地图的覆盖UI */}
      {mapAvailable && (
        <>
          <View style={[styles.statusBarOverlay, { height: insets.top + 10 }]} />

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

          {entries.length > 0 && (
            <View style={[styles.filterContainer, { top: insets.top + 56 }]}>
              <MoodFilter
                activeFilters={moodFilters}
                onToggle={handleToggleMoodFilter}
                onClear={() => setMoodFilters([])}
              />
            </View>
          )}

          <View style={{ position: 'absolute', top: insets.top + (entries.length > 0 ? 104 : 56), right: 16 }}>
            <MapStylePicker
              currentStyle={mapStyle}
              onStyleChange={setMapStyle}
            />
          </View>

          <TouchableOpacity
            style={[styles.recenterButton, { bottom: 110 }]}
            onPress={handleRecenter}
            accessibilityLabel="回到当前位置"
            accessibilityRole="button"
          >
            <Text style={styles.recenterIcon}>📍</Text>
          </TouchableOpacity>
        </>
      )}

      {/* 添加心情按钮 */}
      <TouchableOpacity
        style={[styles.addButton, { bottom: 40 }]}
        onPress={handleAddPress}
        activeOpacity={0.85}
        accessibilityLabel="记录新心情"
        accessibilityRole="button"
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
  // --- Expo Go 备用视图样式 ---
  fallbackMap: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  fallbackHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  fallbackCoords: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  fallbackScroll: {
    flex: 1,
  },
  fallbackContent: {
    paddingBottom: 120,
  },
  fallbackEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  fallbackEmptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  fallbackEmptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  fallbackEmptyHint: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  fallbackNote: {
    marginTop: 24,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 14,
  },
  fallbackNoteText: {
    fontSize: 13,
    color: Colors.primary,
    textAlign: 'center',
    lineHeight: 20,
  },
  markerGrid: {
    gap: 8,
  },
  markerCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  markerCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerEmojiCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  markerEmoji: {
    fontSize: 20,
  },
  markerCardContent: {
    flex: 1,
  },
  markerMoodLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  markerNote: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 2,
  },
  markerMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  markerPhotoIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  // --- 原生地图覆盖UI样式 ---
  filterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
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
