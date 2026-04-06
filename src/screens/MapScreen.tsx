import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { TileMap, MAP_STYLES, MapStyleKey } from '../components/TileMap';
import { MapboxWebView } from '../components/MapboxWebView';
import { NewEntrySheet } from '../components/NewEntrySheet';
import { EntryDetail } from '../components/EntryDetail';
import { WelcomeOverlay } from '../components/WelcomeOverlay';

// 尝试加载原生 Mapbox（开发构建时可用）
let MapboxMapView: any = null;
try {
  MapboxMapView = require('../components/MapboxMapView').MapboxMapView;
} catch {
  // Expo Go 环境下原生 Mapbox 不可用，使用 WebView 版本
}
import { QuickRecordPanel } from '../components/QuickRecordPanel';
import { LocationTimeline } from '../components/LocationTimeline';
import { FriendsModal } from '../components/FriendsModal';
import { getEntriesNearLocation, clusterEntriesByLocation } from '../utils/locationCluster';
import { Entry, MoodType } from '../types';
import AsyncStorage from '../utils/storage';

export const MapScreen: React.FC = () => {
  const { location, loading, error } = useLocation();
  const { entries } = useEntries();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [locationTimelineEntries, setLocationTimelineEntries] = useState<Entry[]>([]);
  const [locationTimelineName, setLocationTimelineName] = useState<string | null>(null);
  const [showLocationTimeline, setShowLocationTimeline] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyleKey>('soft');
  const [showStylePicker, setShowStylePicker] = useState(false);

  useEffect(() => {
    try {
      const hasLaunched = AsyncStorage.getItem('hasLaunched');
      if (!hasLaunched) setShowWelcome(true);
    } catch {}
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    try { AsyncStorage.setItem('hasLaunched', 'true'); } catch {}
  };

  // 聚合标记：同一位置多条记录合并为一个带数字的标记
  const clusteredMarkers = useMemo(() => {
    if (entries.length === 0) return [];
    const clusters = clusterEntriesByLocation(entries, 150);
    return clusters.map((c) => ({
      id: c.entries[0].id,
      latitude: c.latitude,
      longitude: c.longitude,
      emoji: c.entries.length > 1 ? `${c.entries[0].emoji}` : c.entries[0].emoji,
      moodColor: MoodColors[c.entries[0].mood as MoodType] || Colors.primary,
      count: c.entries.length,
    }));
  }, [entries]);

  const handleMarkerPress = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      const nearby = getEntriesNearLocation(entries, entry.latitude, entry.longitude, 200);
      if (nearby.length > 1) {
        setLocationTimelineEntries(nearby);
        setLocationTimelineName(entry.address);
        setShowLocationTimeline(true);
      } else {
        setSelectedEntry(entry);
      }
    }
  }, [entries]);

  const handleFriendPress = () => {
    setShowFriends(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>正在获取位置...</Text>
      </View>
    );
  }

  if (error || !location) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>需要位置权限</Text>
        <Text style={styles.errorHint}>请在设置中允许 MapJournal 访问位置信息</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 全屏地图 — 原生 Mapbox > WebView Mapbox > TileMap */}
      {MapboxMapView ? (
        <MapboxMapView
          location={location}
          markers={clusteredMarkers}
          onMarkerPress={handleMarkerPress}
        />
      ) : (
        <MapboxWebView
          location={location}
          markers={clusteredMarkers}
          onMarkerPress={handleMarkerPress}
        />
      )}

      {/* 顶部浮动标题栏 */}
      <View style={styles.topOverlay}>
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>MapJournal</Text>
          {entries.length > 0 && (
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>{entries.length}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 左侧按钮 */}
      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialBtn} onPress={handleFriendPress} activeOpacity={0.7}>
          <Text style={styles.socialBtnText}>👥 好友</Text>
        </TouchableOpacity>
        {!MapboxMapView && (
          <TouchableOpacity
            style={[styles.socialBtn, { marginTop: 8 }]}
            onPress={() => setShowStylePicker(!showStylePicker)}
            activeOpacity={0.7}
          >
            <Text style={styles.socialBtnText}>
            {MAP_STYLES[mapStyle].icon} 地图
          </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 地图风格选择器 */}
      {!MapboxMapView && showStylePicker && (
        <View style={styles.stylePicker}>
          {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.styleOption,
                mapStyle === key ? styles.styleOptionActive : undefined,
              ]}
              onPress={() => { setMapStyle(key); setShowStylePicker(false); }}
              activeOpacity={0.7}
            >
              <Text style={styles.styleIcon}>{MAP_STYLES[key].icon}</Text>
              <Text style={[
                styles.styleLabel,
                mapStyle === key ? styles.styleLabelActive : undefined,
              ]}>
                {MAP_STYLES[key].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 快速记录面板 — 贴近底部Tab栏 */}
      <View style={styles.quickBarContainer}>
        <QuickRecordPanel
          location={location}
          onFullEntry={() => setShowNewEntry(true)}
          onSaved={() => {}}
        />
      </View>

      {showWelcome && <WelcomeOverlay onGetStarted={handleWelcomeClose} />}

      <NewEntrySheet
        visible={showNewEntry}
        onClose={() => setShowNewEntry(false)}
        location={location}
      />

      <LocationTimeline
        entries={locationTimelineEntries}
        locationName={locationTimelineName}
        visible={showLocationTimeline}
        onClose={() => setShowLocationTimeline(false)}
        onEntryPress={(e) => {
          setShowLocationTimeline(false);
          setSelectedEntry(e);
        }}
      />

      <EntryDetail
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />

      <FriendsModal
        visible={showFriends}
        onClose={() => setShowFriends(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  topOverlay: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    shadowColor: '#7C6CF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  topBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  topBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  socialButtons: {
    position: 'absolute',
    top: 56,
    left: 16,
  },
  socialBtn: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: '#7C6CF0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  stylePicker: {
    position: 'absolute',
    top: 56,
    left: 110,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#7C6CF0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  styleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  styleOptionActive: {
    backgroundColor: Colors.primary + '15',
  },
  styleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  styleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  styleLabelActive: {
    color: Colors.primary,
  },
  quickBarContainer: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
  },
});
