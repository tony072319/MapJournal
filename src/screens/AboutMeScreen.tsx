import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { MOOD_OPTIONS, getMoodByType } from '../constants/moods';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';

const YearInPixels: React.FC<{ entries: Entry[] }> = ({ entries }) => {
  const cells = useMemo(() => {
    const start = dayjs().startOf('year');
    return Array.from({ length: 52 * 7 }, (_, i) => {
      const d = start.add(i, 'day');
      const dayEntries = entries.filter((e) => dayjs(e.createdAt).isSame(d, 'day'));
      if (dayEntries.length === 0) return null;
      const moodIdx = Math.min(...dayEntries.map((e) => MOOD_OPTIONS.findIndex((m) => m.type === e.mood)));
      return MOOD_OPTIONS[moodIdx]?.type as MoodType;
    });
  }, [entries]);

  const cellW = 5.2, cellH = 9, gap = 2;
  return (
    <View style={styles.pixelsCard}>
      <View style={styles.pixelsGrid}>
        {Array.from({ length: 52 }).map((_, w) => (
          <View key={w} style={{ marginRight: gap }}>
            {Array.from({ length: 7 }).map((__, d) => {
              const c = cells[w * 7 + d];
              return (
                <View
                  key={d}
                  style={{
                    width: cellW, height: cellH, borderRadius: 1.2,
                    marginBottom: gap,
                    backgroundColor: c ? MoodColors[c] : Colors.surface2,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>LESS</Text>
        {MOOD_OPTIONS.map((m) => (
          <View key={m.type} style={[styles.legendSwatch, { backgroundColor: MoodColors[m.type] }]} />
        ))}
        <Text style={styles.legendLabel}>MORE</Text>
      </View>
    </View>
  );
};

export const AboutMeScreen: React.FC = () => {
  const { entries } = useEntries();

  // Stats
  const total = entries.length;
  const placesCount = useMemo(() => {
    const set = new Set(entries.map((e) => e.address || `${e.latitude.toFixed(3)},${e.longitude.toFixed(3)}`));
    return set.size;
  }, [entries]);

  const streak = useMemo(() => {
    if (entries.length === 0) return 0;
    const days = new Set(entries.map((e) => dayjs(e.createdAt).format('YYYY-MM-DD')));
    let s = 0; let cur = dayjs();
    while (days.has(cur.format('YYYY-MM-DD'))) { s++; cur = cur.subtract(1, 'day'); }
    return s;
  }, [entries]);

  // Mood distribution
  const moodCounts = useMemo(() => {
    const map: Record<string, number> = {};
    MOOD_OPTIONS.forEach((m) => (map[m.type] = 0));
    entries.forEach((e) => { if (map[e.mood] !== undefined) map[e.mood]++; });
    return map;
  }, [entries]);
  const moodSum = Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;

  // Top places
  const topPlaces = useMemo(() => {
    const map: Record<string, { count: number; moods: Record<string, number> }> = {};
    entries.forEach((e) => {
      const k = e.address || '未知地点';
      if (!map[k]) map[k] = { count: 0, moods: {} };
      map[k].count++;
      map[k].moods[e.mood] = (map[k].moods[e.mood] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 4)
      .map(([name, v]) => {
        const dominant = Object.entries(v.moods).sort(([, a], [, b]) => b - a)[0][0] as MoodType;
        return { name, count: v.count, mood: dominant };
      });
  }, [entries]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.kicker}>MAPJOURNAL · {dayjs().year()}</Text>
        <Text style={styles.title}>
          <Text style={styles.titleItalic}>You,</Text>
          {'\n'}felt <Text style={[styles.titleAccent, { fontStyle: 'italic' }]}>{total} times</Text>.
        </Text>
      </View>

      {/* KPI strip */}
      <View style={styles.kpi}>
        {[
          [String(total), '记录 entries', null as string | null],
          [String(streak), '连续 streak', Colors.primary],
          [String(placesCount), '地点 places', null],
        ].map(([v, l, col], i) => (
          <View key={i} style={[styles.kpiCell, i > 0 && styles.kpiBorder]}>
            <Text style={[styles.kpiValue, col ? { color: col, fontStyle: 'italic' } : null]}>
              {v}
            </Text>
            <Text style={styles.kpiLabel}>{l}</Text>
          </View>
        ))}
      </View>

      {/* Year in pixels */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>You, <Text style={{ fontStyle: 'italic' }}>in pixels</Text></Text>
        <YearInPixels entries={entries} />
      </View>

      {/* Mood portrait */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mood <Text style={{ fontStyle: 'italic' }}>portrait</Text></Text>
        <View style={styles.portraitCard}>
          <View style={styles.portraitBar}>
            {MOOD_OPTIONS.map((m) => {
              const pct = (moodCounts[m.type] / moodSum) * 100;
              if (pct === 0) return null;
              return (
                <View
                  key={m.type}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: MoodColors[m.type],
                  }}
                />
              );
            })}
          </View>
          {MOOD_OPTIONS
            .map((m) => ({ ...m, count: moodCounts[m.type], pct: (moodCounts[m.type] / moodSum) * 100 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map((m) => (
              <View key={m.type} style={styles.portraitRow}>
                <View style={[styles.portraitDot, { backgroundColor: MoodColors[m.type] }]} />
                <Text style={styles.portraitName}>{m.label}</Text>
                <Text style={styles.portraitCount}>{m.count}</Text>
                <Text style={styles.portraitPct}>
                  {m.pct.toFixed(0)}<Text style={styles.portraitPctSmall}>%</Text>
                </Text>
              </View>
            ))}
        </View>
      </View>

      {/* Top places */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where you <Text style={{ fontStyle: 'italic' }}>felt</Text></Text>
        <View style={styles.placesCard}>
          {topPlaces.map((p, i) => (
            <View
              key={i}
              style={[styles.placeRow, i < topPlaces.length - 1 && styles.placeDivider]}
            >
              <Text style={styles.placeRank}>0{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.placeName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.placeMeta}>
                  {p.count} 条 · 最常{' '}
                  <Text style={{ color: MoodColors[p.mood], fontWeight: '600' }}>
                    {getMoodByType(p.mood).label}
                  </Text>
                </Text>
              </View>
              <Text style={styles.placeEmoji}>{getMoodByType(p.mood).emoji}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Insight */}
      <View style={styles.section}>
        <View style={styles.insightCard}>
          <Text style={styles.insightKicker}>✧ INSIGHT</Text>
          <Text style={styles.insightBody}>
            你在 <Text style={styles.insightItalic}>周末早晨</Text> 的心情，
            比一周其它时候 <Text style={styles.insightItalic}>都好</Text>。
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: 20, paddingTop: 58, paddingBottom: 12 },
  kicker: {
    fontFamily: 'Menlo', fontSize: 10, color: Colors.textSecondary,
    letterSpacing: 2.5, marginBottom: 6,
  },
  title: {
    fontFamily: 'Georgia', fontSize: 36, color: Colors.text,
    letterSpacing: -1, lineHeight: 40,
  },
  titleItalic: { fontStyle: 'italic' },
  titleAccent: { color: Colors.primary },

  kpi: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
    padding: 16, backgroundColor: Colors.card, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.border,
  },
  kpiCell: { flex: 1, paddingHorizontal: 12 },
  kpiBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  kpiValue: {
    fontFamily: 'Georgia', fontSize: 32, color: Colors.text,
    letterSpacing: -0.5, lineHeight: 34,
  },
  kpiLabel: {
    fontFamily: 'Menlo', fontSize: 9.5, color: Colors.textSecondary,
    letterSpacing: 1.5, marginTop: 4,
  },

  section: { paddingHorizontal: 20, marginBottom: 22 },
  sectionTitle: {
    fontFamily: 'Georgia', fontSize: 22, color: Colors.text,
    letterSpacing: -0.3, marginBottom: 10,
  },

  pixelsCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  pixelsGrid: {
    flexDirection: 'row', alignItems: 'flex-start',
  },
  legend: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
  },
  legendLabel: {
    fontFamily: 'Menlo', fontSize: 9, color: Colors.textSecondary, letterSpacing: 1,
  },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },

  portraitCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  portraitBar: {
    flexDirection: 'row', height: 36, borderRadius: 8,
    overflow: 'hidden', marginBottom: 16,
  },
  portraitRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10,
  },
  portraitDot: { width: 10, height: 10, borderRadius: 2 },
  portraitName: {
    flex: 1, fontSize: 14, fontWeight: '500', color: Colors.text,
  },
  portraitCount: {
    fontFamily: 'Menlo', fontSize: 11, color: Colors.textSecondary,
  },
  portraitPct: {
    fontFamily: 'Georgia', fontStyle: 'italic', fontSize: 16,
    color: Colors.text, width: 42, textAlign: 'right',
  },
  portraitPctSmall: { fontSize: 10, color: Colors.textSecondary },

  placesCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  placeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  placeDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  placeRank: {
    fontFamily: 'Menlo', fontSize: 11, color: Colors.muted,
    letterSpacing: 1, width: 20,
  },
  placeName: { fontSize: 14, fontWeight: '500', color: Colors.text },
  placeMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  placeEmoji: { fontSize: 18 },

  insightCard: {
    backgroundColor: Colors.text, borderRadius: 18, padding: 20,
  },
  insightKicker: {
    fontFamily: 'Menlo', fontSize: 10, color: Colors.primary,
    letterSpacing: 2, marginBottom: 8,
  },
  insightBody: {
    fontFamily: 'Georgia', fontSize: 18,
    color: Colors.background, lineHeight: 26, letterSpacing: -0.2,
  },
  insightItalic: { color: Colors.primary, fontStyle: 'italic' },
});
