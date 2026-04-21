import React, { useState, useMemo } from 'react';
import {
  View, SectionList, StyleSheet, Text, Image,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { EntryDetail } from '../components/EntryDetail';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType, MOOD_OPTIONS } from '../constants/moods';
import { formatRelative } from '../utils/dateFormat';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const formatSectionTitle = (d: string) => {
  const x = dayjs(d);
  if (x.isToday()) return ['Today', '今天'];
  if (x.isYesterday()) return ['Yesterday', '昨天'];
  if (x.isAfter(dayjs().subtract(7, 'day'))) return [x.format('dddd'), x.format('dddd')];
  return [x.format('MMM D'), x.format('M月D日')];
};

interface Section { title: [string, string]; data: Entry[]; }

const MoodRibbon: React.FC<{ entries: Entry[] }> = ({ entries }) => {
  const last14 = useMemo(() => {
    const now = dayjs();
    const days = Array.from({ length: 14 }, (_, i) => now.subtract(13 - i, 'day'));
    return days.map((d) => {
      const dayEntries = entries.filter((e) => dayjs(e.createdAt).isSame(d, 'day'));
      if (dayEntries.length === 0) return { count: 0, mood: null as MoodType | null };
      const moodIdx = Math.min(...dayEntries.map((e) => MOOD_OPTIONS.findIndex((m) => m.type === e.mood)));
      return { count: dayEntries.length, mood: MOOD_OPTIONS[moodIdx]?.type as MoodType };
    });
  }, [entries]);

  return (
    <View style={styles.ribbon}>
      <View style={styles.ribbonHead}>
        <Text style={styles.ribbonLabel}>LAST 14 DAYS · 近两周</Text>
      </View>
      <View style={styles.ribbonBars}>
        {last14.map((d, i) => (
          <View
            key={i}
            style={[
              styles.ribbonBar,
              {
                height: Math.max(4, d.count * 8),
                backgroundColor: d.mood ? MoodColors[d.mood] : Colors.border,
                opacity: d.count ? 1 : 0.4,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const JournalCard = ({ entry, onPress, isLast }: { entry: Entry; onPress: () => void; isLast: boolean }) => {
  const mood = getMoodByType(entry.mood);
  const c = MoodColors[entry.mood as MoodType] || Colors.primary;
  return (
    <TouchableOpacity style={styles.cardRow} onPress={onPress} activeOpacity={0.8}>
      {/* Left rail */}
      <View style={styles.rail}>
        <Text style={styles.railTime}>{dayjs(entry.createdAt).format('H:mm')}</Text>
        <View style={[styles.railDot, { backgroundColor: c }]} />
        {!isLast && <View style={styles.railLine} />}
      </View>
      {/* Card body */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.moodTag, { color: c }]}>
              {mood.label.toUpperCase()} · {mood.emoji}
            </Text>
            {entry.address ? <Text style={styles.place}>📍 {entry.address}</Text> : null}
          </View>
          <Text style={styles.rel}>{formatRelative(entry.createdAt)}</Text>
        </View>
        {entry.note ? (
          <Text style={styles.serifNote} numberOfLines={4}>「{entry.note}」</Text>
        ) : null}
        {entry.photoUri ? <Image source={{ uri: entry.photoUri }} style={styles.photo} /> : null}
      </View>
    </TouchableOpacity>
  );
};

export const TimelineScreen: React.FC = () => {
  const { entries, refreshEntries: refresh } = useEntries();
  const [selected, setSelected] = useState<Entry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const sections = useMemo<Section[]>(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const groups: Record<string, Entry[]> = {};
    sorted.forEach((e) => {
      const key = dayjs(e.createdAt).format('YYYY-MM-DD');
      (groups[key] = groups[key] || []).push(e);
    });
    return Object.entries(groups).map(([k, data]) => ({
      title: formatSectionTitle(k) as [string, string],
      data,
    }));
  }, [entries]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { await refresh(); } finally { setRefreshing(false); }
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.hKicker}>MAPJOURNAL · 日志</Text>
            <Text style={styles.hTitle}>
              <Text style={styles.hTitleItalic}>Your</Text> story.
            </Text>
            <MoodRibbon entries={entries} />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{section.title[1]}</Text>
            <View style={styles.sectionRule} />
            <Text style={styles.sectionCount}>
              {String(section.data.length).padStart(2, '0')}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <JournalCard
            entry={item}
            onPress={() => setSelected(item)}
            isLast={index === section.data.length - 1}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>还没有记录</Text>
            <Text style={styles.emptyHint}>在地图上放下第一枚心情别针。</Text>
          </View>
        }
      />
      <EntryDetail entry={selected} onClose={() => setSelected(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 58, paddingBottom: 12 },
  hKicker: {
    fontFamily: 'Menlo', fontSize: 10, color: Colors.textSecondary,
    letterSpacing: 2.5, marginBottom: 6,
  },
  hTitle: {
    fontFamily: 'Georgia', fontSize: 38, color: Colors.text,
    letterSpacing: -1, lineHeight: 40, marginBottom: 16,
  },
  hTitleItalic: { fontStyle: 'italic' },

  ribbon: {
    padding: 12, backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, marginTop: 8,
  },
  ribbonHead: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8,
  },
  ribbonLabel: {
    fontFamily: 'Menlo', fontSize: 10, color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  ribbonBars: {
    flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 40,
  },
  ribbonBar: { flex: 1, borderRadius: 2 },

  sectionHead: {
    flexDirection: 'row', alignItems: 'baseline',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
  },
  sectionTitle: {
    fontFamily: 'Georgia', fontStyle: 'italic',
    fontSize: 34, color: Colors.text, letterSpacing: -0.8, lineHeight: 36,
  },
  sectionRule: {
    flex: 1, height: 1, backgroundColor: Colors.border,
    marginHorizontal: 10, marginBottom: 8,
  },
  sectionCount: {
    fontFamily: 'Menlo', fontSize: 11, color: Colors.textSecondary,
    letterSpacing: 1.5,
  },

  cardRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 20 },
  rail: { width: 52, paddingTop: 4, alignItems: 'flex-end', position: 'relative' },
  railTime: {
    fontFamily: 'Menlo', fontSize: 10,
    color: Colors.textSecondary, letterSpacing: 1,
  },
  railDot: {
    width: 18, height: 18, borderRadius: 9,
    marginTop: 8, borderWidth: 3, borderColor: Colors.background,
  },
  railLine: {
    position: 'absolute', right: 8, top: 48, bottom: -12,
    width: 1, backgroundColor: Colors.border,
  },
  card: {
    flex: 1, marginBottom: 12,
    backgroundColor: Colors.card, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardHead: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 10,
  },
  moodTag: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 2,
  },
  place: { fontSize: 12, color: Colors.textSecondary },
  rel: {
    fontFamily: 'Menlo', fontSize: 10,
    color: Colors.muted, marginTop: 2,
  },
  serifNote: {
    fontFamily: 'Georgia', fontSize: 16,
    lineHeight: 23, color: Colors.text, letterSpacing: -0.1,
  },
  photo: { width: '100%', aspectRatio: 16 / 10, borderRadius: 10, marginTop: 10 },

  empty: { alignItems: 'center', padding: 60 },
  emptyTitle: {
    fontFamily: 'Georgia', fontSize: 22,
    fontStyle: 'italic', color: Colors.text, marginBottom: 6,
  },
  emptyHint: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center',
  },
});
