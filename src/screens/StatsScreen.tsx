import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { MOOD_OPTIONS } from '../constants/moods';
import { MoodChart } from '../components/MoodChart';
import { MoodType } from '../types';
import dayjs from 'dayjs';

type Period = 'week' | 'month' | 'all';

export const StatsScreen: React.FC = () => {
  const { entries } = useEntries();
  const [period, setPeriod] = useState<Period>('week');

  // 根据选择的时段筛选记录
  const filteredEntries = useMemo(() => {
    if (period === 'all') return entries;
    const now = dayjs();
    const start = period === 'week' ? now.subtract(7, 'day') : now.subtract(30, 'day');
    return entries.filter((e) => dayjs(e.createdAt).isAfter(start));
  }, [entries, period]);

  // 心情分布统计
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MOOD_OPTIONS.forEach((m) => (counts[m.type] = 0));
    filteredEntries.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    return counts;
  }, [filteredEntries]);

  const totalCount = filteredEntries.length;
  const maxCount = Math.max(...Object.values(moodCounts), 1);

  // 最常出现的心情
  const topMood = useMemo(() => {
    if (totalCount === 0) return null;
    const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    return MOOD_OPTIONS.find((m) => m.type === sorted[0][0]) || null;
  }, [moodCounts, totalCount]);

  // 连续记录天数
  const streakDays = useMemo(() => {
    if (entries.length === 0) return 0;
    const dates = [...new Set(entries.map((e) => dayjs(e.createdAt).format('YYYY-MM-DD')))].sort().reverse();
    let streak = 0;
    let current = dayjs();
    for (const dateStr of dates) {
      const diff = current.diff(dayjs(dateStr), 'day');
      if (diff <= 1) {
        streak++;
        current = dayjs(dateStr);
      } else {
        break;
      }
    }
    return streak;
  }, [entries]);

  // 不同记录天数
  const uniqueDays = useMemo(() => {
    return new Set(entries.map((e) => dayjs(e.createdAt).format('YYYY-MM-DD'))).size;
  }, [entries]);

  // 照片数
  const photoCount = useMemo(() => {
    return entries.filter((e) => e.photoUri).length;
  }, [entries]);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>📊</Text>
        <Text style={styles.emptyTitle}>还没有统计数据</Text>
        <Text style={styles.emptyHint}>记录更多心情后，这里会展示你的心情趋势</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 时段选择器 */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'all'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p && styles.periodButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[styles.periodText, period === p && styles.periodTextActive]}
            >
              {p === 'week' ? '本周' : p === 'month' ? '本月' : '全部'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 7天心情趋势折线图 */}
      <MoodChart entries={entries} />

      {/* 总览卡片 */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryNumber}>{totalCount}</Text>
        <Text style={styles.summaryLabel}>条心情记录</Text>
        {topMood && (
          <View style={styles.topMoodRow}>
            <Text style={styles.topMoodLabel}>最常出现的心情</Text>
            <Text style={styles.topMoodEmoji}>{topMood.emoji}</Text>
            <Text style={styles.topMoodName}>{topMood.label}</Text>
          </View>
        )}
      </View>

      {/* 心情分布柱状图 */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>心情分布</Text>
        {MOOD_OPTIONS.map((mood) => {
          const count = moodCounts[mood.type] || 0;
          const width = totalCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <View key={mood.type} style={styles.barRow}>
              <Text style={styles.barEmoji}>{mood.emoji}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${width}%`,
                      backgroundColor: MoodColors[mood.type as MoodType],
                    },
                  ]}
                />
              </View>
              <Text style={styles.barCount}>
                {count}{totalCount > 0 ? ` (${Math.round((count / totalCount) * 100)}%)` : ''}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 连续记录天数 & 有趣统计 */}
      <View style={styles.insightsRow}>
        <View style={styles.insightCard}>
          <Text style={styles.insightEmoji}>🔥</Text>
          <Text style={styles.insightNumber}>{streakDays}</Text>
          <Text style={styles.insightLabel}>连续记录</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightEmoji}>📅</Text>
          <Text style={styles.insightNumber}>{uniqueDays}</Text>
          <Text style={styles.insightLabel}>记录天数</Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightEmoji}>📸</Text>
          <Text style={styles.insightNumber}>{photoCount}</Text>
          <Text style={styles.insightLabel}>照片数</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  topMoodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  topMoodLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  topMoodEmoji: {
    fontSize: 24,
    marginRight: 4,
  },
  topMoodName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barEmoji: {
    fontSize: 24,
    width: 36,
  },
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
    minWidth: 4,
  },
  barCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    width: 52,
    textAlign: 'right',
  },
  insightsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  insightCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  insightEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  insightNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  insightLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
});
