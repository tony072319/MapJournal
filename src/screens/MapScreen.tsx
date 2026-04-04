import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { TileMap } from '../components/TileMap';
import { NewEntrySheet } from '../components/NewEntrySheet';
import { EntryDetail } from '../components/EntryDetail';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { QuickMoodBar } from '../components/QuickMoodBar';
import { StreakBanner } from '../components/StreakBanner';
import { MapTimeline } from '../components/MapTimeline';
import { Entry, MoodType } from '../types';
import { formatRelative } from '../utils/dateFormat';
import AsyncStorage from '../utils/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MapScreen: React.FC = () => {
  const { location, loading, error } = useLocation();
  const { entries } = useEntries();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);

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

  const handleMarkerPress = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) setSelectedEntry(entry);
  }, [entries]);

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

  // 最近的几条记录（用于底部面板）
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <View style={styles.container}>
      {/* 全屏地图 */}
      <TileMap
        location={location}
        markers={entries.map((e) => ({
          id: e.id,
          latitude: e.latitude,
          longitude: e.longitude,
          emoji: e.emoji,
          moodColor: MoodColors[e.mood as MoodType] || Colors.primary,
        }))}
        onMarkerPress={handleMarkerPress}
        zoom={15}
      />

      {/* 顶部浮动信息 */}
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

      {/* 底部浮动面板 */}
      <View style={[styles.bottomPanel, panelExpanded ? styles.bottomPanelExpanded : undefined]}>
        {/* 拖拽把手 */}
        <TouchableOpacity
          style={styles.panelHandle}
          onPress={() => setPanelExpanded(!panelExpanded)}
          activeOpacity={0.8}
        >
          <View style={styles.handleBar} />
          <Text style={styles.panelTitle}>
            {entries.length === 0 ? '还没有心情记录' : `最近的心情`}
          </Text>
        </TouchableOpacity>

        {/* 收起时：连续记录 + 7天打卡 */}
        {!panelExpanded && <StreakBanner entries={entries} />}

        {/* 展开时：横向时间轴 + 列表 */}
        {panelExpanded && (
          <ScrollView
            style={styles.panelScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* 横向时间轴卡片 — Polarsteps 风格 */}
            <MapTimeline entries={entries} onEntryPress={(e) => setSelectedEntry(e)} />

            {entries.length === 0 && (
              <Text style={styles.panelEmpty}>
                点击快速记录栏开始记录心情
              </Text>
            )}

            {recentEntries.map((entry) => {
              const mood = getMoodByType(entry.mood);
              const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;
              return (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.panelCard}
                  onPress={() => setSelectedEntry(entry)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.panelCardDot, { backgroundColor: moodColor }]} />
                  <Text style={styles.panelCardEmoji}>{entry.emoji}</Text>
                  <View style={styles.panelCardContent}>
                    <Text style={[styles.panelCardMood, { color: moodColor }]}>{mood.label}</Text>
                    {entry.note ? (
                      <Text style={styles.panelCardNote} numberOfLines={1}>{entry.note}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.panelCardTime}>{formatRelative(entry.createdAt)}</Text>
                </TouchableOpacity>
              );
            })}

            {entries.length > 5 && (
              <Text style={styles.panelMore}>还有 {entries.length - 5} 条记录...</Text>
            )}
          </ScrollView>
        )}
      </View>

      {/* 快速心情记录栏 — Daylio 风格一键记录 */}
      <View style={styles.quickBarContainer}>
        <QuickMoodBar
          location={location}
          onFullEntry={() => setShowNewEntry(true)}
          onSaved={() => setPanelExpanded(false)}
        />
      </View>

      {showWelcome && <WelcomeOverlay onGetStarted={handleWelcomeClose} />}

      <NewEntrySheet
        visible={showNewEntry}
        onClose={() => setShowNewEntry(false)}
        location={location}
      />

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
  // 顶部浮动
  topOverlay: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
  // 底部面板
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 80,
    maxHeight: 190,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomPanelExpanded: {
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  panelHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  panelScroll: {
    paddingHorizontal: 16,
  },
  panelEmpty: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  panelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  panelCardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  panelCardEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  panelCardContent: {
    flex: 1,
  },
  panelCardMood: {
    fontSize: 14,
    fontWeight: '700',
  },
  panelCardNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  panelCardTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  panelMore: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
    paddingVertical: 12,
  },
  // 快速记录栏
  quickBarContainer: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
  },
});
