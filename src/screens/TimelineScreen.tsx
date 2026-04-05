import React, { useState, useMemo } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { EntryDetail } from '../components/EntryDetail';
import { TimelineFilters } from '../components/TimelineFilters';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { ACTIVITY_OPTIONS } from '../constants/activities';
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

        {/* 活动标签 */}
        {entry.activities ? (
          <View style={styles.itemActivities}>
            {(JSON.parse(entry.activities) as string[]).slice(0, 4).map((a) => {
              const act = ACTIVITY_OPTIONS.find((o) => o.id === a);
              return <Text key={a} style={styles.itemActivityTag}>{act ? `${act.icon} ${act.label}` : a}</Text>;
            })}
          </View>
        ) : null}

        {entry.note ? (
          <Text style={styles.itemNote} numberOfLines={3}>{entry.note}</Text>
        ) : null}

        {entry.photoUri ? (
          <Image source={{ uri: entry.photoUri }} style={styles.itemPhoto} />
        ) : null}

        {entry.address ? (
          <View style={styles.itemLocationRow}>
            <Text style={styles.itemLocationPin}>📍</Text>
            <Text style={styles.itemAddress} numberOfLines={1}>{entry.address}</Text>
          </View>
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
  const [searchText, setSearchText] = useState('');
  const [period, setPeriod] = useState<'all' | 'week' | 'month'>('all');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const handleToggleMoodFilter = (mood: MoodType) => {
    setMoodFilters((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const sections: Section[] = useMemo(() => {
    let filtered = entries;

    // 时段筛选
    if (period !== 'all') {
      const now = dayjs();
      const start = period === 'week' ? now.subtract(7, 'day') : now.subtract(30, 'day');
      filtered = filtered.filter((e) => dayjs(e.createdAt).isAfter(start));
    }

    // 城市筛选
    if (selectedCity) {
      filtered = filtered.filter((e) => e.address && e.address.includes(selectedCity));
    }

    // 心情筛选
    if (moodFilters.length > 0) {
      filtered = filtered.filter((e) => moodFilters.includes(e.mood as MoodType));
    }

    // 文本搜索
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter((e) =>
        (e.note && e.note.toLowerCase().includes(q)) ||
        (e.address && e.address.toLowerCase().includes(q)) ||
        (e.activities && e.activities.toLowerCase().includes(q))
      );
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
  }, [entries, moodFilters, searchText, period, selectedCity]);

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
          <View>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索心情、地点、活动..."
              placeholderTextColor={Colors.textSecondary}
              value={searchText}
              onChangeText={setSearchText}
              clearButtonMode="while-editing"
            />
            <TimelineFilters
              entries={entries}
              period={period}
              onPeriodChange={setPeriod}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              moodFilters={moodFilters}
              onMoodToggle={handleToggleMoodFilter}
              onMoodClear={() => setMoodFilters([])}
            />
          </View>
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
  searchInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
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
  itemActivities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  itemActivityTag: {
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: Colors.primary + '10',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
    fontWeight: '500',
    overflow: 'hidden',
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
  itemLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemLocationPin: {
    fontSize: 11,
    marginRight: 4,
  },
  itemAddress: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
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
