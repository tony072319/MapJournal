import React, { useState, useMemo } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { TimelineCard } from '../components/TimelineCard';
import { EntryDetail } from '../components/EntryDetail';
import { MoodFilter } from '../components/MoodFilter';
import { Colors } from '../constants/colors';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

// 格式化日期分组标题
const formatSectionTitle = (dateStr: string): string => {
  const date = dayjs(dateStr);
  if (date.isToday()) return '今天';
  if (date.isYesterday()) return '昨天';
  if (date.isAfter(dayjs().subtract(7, 'day'))) return date.format('dddd'); // 星期X
  if (date.year() === dayjs().year()) return date.format('M月D日');
  return date.format('YYYY年M月D日');
};

interface Section {
  title: string;
  data: Entry[];
  count: number;
}

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

  // 按日期分组（带心情筛选）
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
        <Text style={styles.emptyEmoji}>📝</Text>
        <Text style={styles.emptyTitle}>还没有心情记录</Text>
        <Text style={styles.emptyHint}>
          去地图页面点击 "+" 按钮{'\n'}记录你的第一条心情吧
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
          <TimelineCard entry={item} onPress={() => setSelectedEntry(item)} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionCount}>{section.count}</Text>
            </View>
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
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionBadge: {
    marginLeft: 8,
    backgroundColor: Colors.primary + '18',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 10,
  },
  emptyHint: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
