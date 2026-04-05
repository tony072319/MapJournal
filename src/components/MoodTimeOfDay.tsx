import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';

interface Props {
  entries: Entry[];
}

const TIME_PERIODS = [
  { key: 'morning', label: '早上', icon: '🌅', range: [6, 12] },
  { key: 'afternoon', label: '下午', icon: '☀️', range: [12, 18] },
  { key: 'evening', label: '晚上', icon: '🌙', range: [18, 24] },
  { key: 'night', label: '深夜', icon: '⭐', range: [0, 6] },
];

const moodToValue: Record<string, number> = {
  amazing: 8, happy: 7, good: 6, calm: 5, neutral: 4, anxious: 3, sad: 2, angry: 1,
};

export const MoodTimeOfDay: React.FC<Props> = ({ entries }) => {
  const periodData = useMemo(() => {
    if (entries.length < 3) return [];

    return TIME_PERIODS.map((period) => {
      const periodEntries = entries.filter((e) => {
        const hour = dayjs(e.createdAt).hour();
        if (period.range[0] < period.range[1]) {
          return hour >= period.range[0] && hour < period.range[1];
        }
        return hour >= period.range[0] || hour < period.range[1];
      });

      if (periodEntries.length === 0) return null;

      // 找出这个时段最常见的心情
      const moodCounts: Record<string, number> = {};
      periodEntries.forEach((e) => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      });
      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
      const moodInfo = getMoodByType(topMood[0]);

      // 平均心情值
      const avgMood = periodEntries.reduce((sum, e) => sum + (moodToValue[e.mood] || 4), 0) / periodEntries.length;

      return {
        ...period,
        count: periodEntries.length,
        topEmoji: moodInfo.emoji,
        topLabel: moodInfo.label,
        avgMood,
        color: MoodColors[topMood[0] as MoodType] || Colors.textSecondary,
      };
    }).filter(Boolean);
  }, [entries]);

  if (periodData.length < 2) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>时段 × 心情</Text>
      <Text style={styles.subtitle}>一天中不同时段的心情倾向</Text>

      <View style={styles.grid}>
        {periodData.map((p: any) => (
          <View key={p.key} style={styles.periodCard}>
            <Text style={styles.periodIcon}>{p.icon}</Text>
            <Text style={styles.periodLabel}>{p.label}</Text>
            <View style={[styles.periodMoodCircle, { backgroundColor: p.color + '18' }]}>
              <Text style={styles.periodEmoji}>{p.topEmoji}</Text>
            </View>
            <Text style={[styles.periodMoodLabel, { color: p.color }]}>{p.topLabel}</Text>
            <Text style={styles.periodCount}>{p.count}次</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  periodIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  periodMoodCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  periodEmoji: {
    fontSize: 18,
  },
  periodMoodLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  periodCount: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
