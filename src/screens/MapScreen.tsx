import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
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
import { Entry, MoodType } from '../types';
import { formatRelative } from '../utils/dateFormat';
import AsyncStorage from '../utils/storage';

export const MapScreen: React.FC = () => {
  const { location, loading, error } = useLocation();
  const { entries } = useEntries();
  const insets = useSafeAreaInsets();
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
      if (!hasLaunched) {
        setShowWelcome(true);
      }
    } catch {}
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    try { AsyncStorage.setItem('hasLaunched', 'true'); } catch {}
  };

  const handleAddPress = useCallback(() => {
    setShowNewEntry(true);
  }, []);

  const handleEntryPress = useCallback((entry: Entry) => {
    setSelectedEntry(entry);
  }, []);

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
        <Text style={styles.errorEmoji}>📍</Text>
        <Text style={styles.errorText}>{error || '无法获取位置'}</Text>
        <Text style={styles.errorHint}>请在设置中允许App访问位置信息</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>MapJournal</Text>
        <View style={styles.headerRight}>
          <Text style={styles.coords}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
          {entries.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{entries.length}</Text>
            </View>
          )}
        </View>
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

      {/* 内容区 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 空状态 */}
        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>你的心情地图</Text>
            <Text style={styles.emptyHint}>
              点击下方 "+" 按钮{'\n'}记录你的第一条心情
            </Text>
          </View>
        )}

        {/* 筛选后无结果 */}
        {filteredEntries.length === 0 && entries.length > 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyHint}>没有匹配的心情记录</Text>
          </View>
        )}

        {/* 心情卡片列表 */}
        {filteredEntries.map((entry) => {
          const mood = getMoodByType(entry.mood);
          const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;
          return (
            <TouchableOpacity
              key={entry.id}
              style={[styles.card, { borderLeftColor: moodColor }]}
              onPress={() => handleEntryPress(entry)}
              activeOpacity={0.7}
            >
              <View style={styles.cardRow}>
                <View style={[styles.emojiCircle, { backgroundColor: moodColor + '15', borderColor: moodColor }]}>
                  <Text style={styles.cardEmoji}>{entry.emoji}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.cardMood, { color: moodColor }]}>{mood.label}</Text>
                  {entry.note && (
                    <Text style={styles.cardNote} numberOfLines={1}>{entry.note}</Text>
                  )}
                  <Text style={styles.cardMeta}>
                    {formatRelative(entry.createdAt)}
                    {entry.address ? ` · ${entry.address}` : ''}
                  </Text>
                </View>
                {entry.photoUri && <Text style={styles.photoIcon}>📷</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* "+" 按钮 */}
      <TouchableOpacity
        style={[styles.addButton, { bottom: 30 }]}
        onPress={handleAddPress}
        activeOpacity={0.85}
        accessibilityLabel="记录新心情"
        accessibilityRole="button"
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
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coords: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardEmoji: {
    fontSize: 22,
  },
  cardContent: {
    flex: 1,
  },
  cardMood: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardNote: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  photoIcon: {
    fontSize: 16,
    marginLeft: 8,
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
});
