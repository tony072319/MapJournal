import React, { useState, useMemo } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { EntryDetail } from '../components/EntryDetail';
import { MoodFilter } from '../components/MoodFilter';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { formatRelative, formatShortDate } from '../utils/dateFormat';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const formatSectionTitle = (dateStr: string): string => {
  const date = dayjs(dateStr);
  if (date.isToday()) return '今天';
  if (date.isYesterday()) return '昨天';
  if (date.isAfter(dayjs().subtract(7, 'day'))) return date.format('dddd');
  if (date.year() === dayjs().year()) return date.format('M月D日');
  return date.format('YYYY年M月D日');
};

interface Section {
  title: string;
  data: Entry[];
  count: number;
}

// 内联的时间线卡片 — 更紧凑的设计
const TimelineItem = ({ entry, onPress }: { entry: Entry; onPress: () => void }) => {
  const mood = getMoodByType(entry.mood);
  const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;

  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      {/* 左侧时间线 */}
      <View style={styles.itemTimeline}>
        <View style={[styles.itemDot, { backgroundColor: moodColor }]} />
        <View style={styles.itemLine} />
      </View>

      {/* 右侧内容卡片 */}
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemHeaderLeft}>
            <Text style={styles.itemEmoji}>{entry.emoji}</Text>
            <Text style={[styles.itemMood, { color: moodColor }]}>{mood.label}</Text>
          </View>
          <Text style={styles.itemTime}>{formatRelative(entry.createdAt)}</Text>
        </View>

        {entry.note ? (
          <Text style={styles.itemNote} numberOfLines={3}>{entry.note}</Text>
        ) : null}

        {entry.photoUri ? (
          <Image source={{ uri: entry.photoUri }} style={styles.itemPhoto} />
        ) : null}

        {entry.address ? (
          <Text style={styles.itemAddress} numberOfLines={1}>{entry.address}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export const TimelineScreen: React.FC = () => {
  const { entries, refreshEntries } = useEntries();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [moodFilters, setMoodFilters] = useState<MoodType[]>([]);

  const handleToggleMoodFilter = (mood: MoodType) => {
    setMoodFilters((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const sections: Section[] = useMemo(() => {
    let filtered = entries;
    if (moodFilters.length > 0) {
      filtered = entries.filter((e) => moodFilters.includes(e.mood as MoodType));
    }

    const sorted = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const groups: Record<string, Entry[]> = {};
    sorted.forEach((entry) => {
      const dateKey = dayjs(entry.createdAt).format('YYYY-MM-DD');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(entry);
    });

    return Object.entries(groups).map(([dateKey, data]) => ({
      title: formatSectionTitle(dateKey),
      data,
      count: data.length,
    }));
  }, [entries, moodFilters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshEntries();
    setRefreshing(false);
  };

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {/* 时间线视觉隐喻 */}
        <View style={styles.emptyTimeline}>
          <View style={styles.emptyTimelineLine} />
          {[0.3, 0.5, 0.7].map((opacity, i) => (
            <View key={i} style={[styles.emptyTimelineDot, { opacity }]} />
          ))}
        </View>
        <Text style={styles.emptyTitle}>你的心情故事</Text>
        <Text style={styles.emptyHint}>
          {'每个时刻都是故事的一部分\n去首页记录你的第一条心情'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <MoodFilter
            activeFilters={moodFilters}
            onToggle={handleToggleMoodFilter}
            onClear={() => setMoodFilters([])}
          />
        }
        renderItem={({ item }) => (
          <TimelineItem entry={item} onPress={() => setSelectedEntry(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionCount}>{section.count}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  // 时间线条目
  item: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  itemTimeline: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  itemLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  itemCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  itemMood: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemNote: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
    marginBottom: 6,
  },
  itemPhoto: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // 日期分组头
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 40,
  },
  emptyTimeline: {
    alignItems: 'center',
    marginBottom: 24,
    height: 80,
    justifyContent: 'space-around',
  },
  emptyTimelineLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: Colors.border,
  },
  emptyTimelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
