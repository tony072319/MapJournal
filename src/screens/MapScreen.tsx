import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useLocation } from '../hooks/useLocation';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { NewEntrySheet } from '../components/NewEntrySheet';
import { EntryDetail } from '../components/EntryDetail';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { MoodFilter } from '../components/MoodFilter';
import { Entry, MoodType } from '../types';
import { formatRelative } from '../utils/dateFormat';
import AsyncStorage from '../utils/storage';

export const MapScreen: React.FC = () => {
  const { location, loading, error } = useLocation();
  const { entries } = useEntries();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [moodFilters, setMoodFilters] = useState<MoodType[]>([]);

  const filteredEntries = moodFilters.length === 0
    ? entries
    : entries.filter((e) => moodFilters.includes(e.mood as MoodType));

  const handleToggleMoodFilter = useCallback((mood: MoodType) => {
    setMoodFilters((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  }, []);

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
      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>MapJournal</Text>
          {entries.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{entries.length} 条记录</Text>
            </View>
          )}
        </View>
        <Text style={styles.location}>
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      </View>

      {/* 心情筛选 */}
      {entries.length > 0 && (
        <View style={styles.filterRow}>
          <MoodFilter
            activeFilters={moodFilters}
            onToggle={handleToggleMoodFilter}
            onClear={() => setMoodFilters([])}
          />
        </View>
      )}

      {/* 内容 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {entries.length === 0 && (
          <View style={styles.emptyState}>
            {/* 装饰性视觉元素 — 像 FocusTraveller 那样用视觉隐喻 */}
            <View style={styles.emptyScene}>
              <View style={styles.emptyMountain}>
                <View style={[styles.mountainPeak, { height: 40, backgroundColor: '#E0E7FF' }]} />
                <View style={[styles.mountainPeak, { height: 60, backgroundColor: '#C7D2FE', marginLeft: -10 }]} />
                <View style={[styles.mountainPeak, { height: 50, backgroundColor: '#DDD6FE', marginLeft: -10 }]} />
              </View>
              <View style={styles.emptyPath}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.pathDot, { opacity: 0.3 + i * 0.15 }]} />
                ))}
              </View>
            </View>
            <Text style={styles.emptyTitle}>开始你的心情旅程</Text>
            <Text style={styles.emptyHint}>
              {'每一个心情都值得被记录\n点击下方 "+" 留下你的第一个足迹'}
            </Text>
          </View>
        )}

        {filteredEntries.length === 0 && entries.length > 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>没有匹配的记录</Text>
            <Text style={styles.emptyHint}>试试取消筛选条件</Text>
          </View>
        )}

        {filteredEntries.map((entry) => {
          const mood = getMoodByType(entry.mood);
          const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;
          return (
            <TouchableOpacity
              key={entry.id}
              style={styles.card}
              onPress={() => setSelectedEntry(entry)}
              activeOpacity={0.7}
            >
              {/* 顶部心情色条 */}
              <View style={[styles.cardColorBar, { backgroundColor: moodColor }]} />

              <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                  <View style={[styles.emojiCircle, { backgroundColor: moodColor + '12' }]}>
                    <Text style={styles.cardEmoji}>{entry.emoji}</Text>
                  </View>
                  <View style={styles.cardContent}>
                    <View style={styles.cardTopRow}>
                      <Text style={[styles.cardMood, { color: moodColor }]}>{mood.label}</Text>
                      <Text style={styles.cardTime}>{formatRelative(entry.createdAt)}</Text>
                    </View>
                    {entry.note ? (
                      <Text style={styles.cardNote} numberOfLines={2}>{entry.note}</Text>
                    ) : null}
                    {entry.address ? (
                      <Text style={styles.cardAddress} numberOfLines={1}>{entry.address}</Text>
                    ) : null}
                  </View>
                </View>

                {/* 照片预览 */}
                {entry.photoUri ? (
                  <Image source={{ uri: entry.photoUri }} style={styles.cardPhoto} />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* "+" 按钮 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowNewEntry(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

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
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  location: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  // 空状态
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyScene: {
    alignItems: 'center',
    marginBottom: 28,
  },
  emptyMountain: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  mountainPeak: {
    width: 36,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  emptyPath: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginHorizontal: 6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyHint: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  // 卡片
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  cardColorBar: {
    height: 3,
  },
  cardBody: {
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  emojiCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardEmoji: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardMood: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardNote: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardPhoto: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginTop: 10,
  },
  // 加载/错误
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
  // + 按钮
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  addButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
