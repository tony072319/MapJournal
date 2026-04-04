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
import { MoodCalendar } from '../components/MoodCalendar';
import { YearPixels } from '../components/YearPixels';
import { EntryDetail } from '../components/EntryDetail';
import { ACTIVITY_OPTIONS } from '../constants/activities';
import { MoodType, Entry } from '../types';
import dayjs from 'dayjs';

type Period = 'week' | 'month' | 'all';

export const StatsScreen: React.FC = () => {
  const { entries } = useEntries();
  const [period, setPeriod] = useState<Period>('week');
  const [selectedDayEntry, setSelectedDayEntry] = useState<Entry | null>(null);

  const handleDayPress = (_date: string, dayEntries: Entry[]) => {
    if (dayEntries.length > 0) {
      setSelectedDayEntry(dayEntries[0]);
    }
  };

  const filteredEntries = useMemo(() => {
    if (period === 'all') return entries;
    const now = dayjs();
    const start = period === 'week' ? now.subtract(7, 'day') : now.subtract(30, 'day');
    return entries.filter((e) => dayjs(e.createdAt).isAfter(start));
  }, [entries, period]);

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

  const topMood = useMemo(() => {
    if (totalCount === 0) return null;
    const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    return MOOD_OPTIONS.find((m) => m.type === sorted[0][0]) || null;
  }, [moodCounts, totalCount]);

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
      } else break;
    }
    return streak;
  }, [entries]);

  const uniqueDays = useMemo(() => {
    return new Set(entries.map((e) => dayjs(e.createdAt).format('YYYY-MM-DD'))).size;
  }, [entries]);

  const photoCount = useMemo(() => {
    return entries.filter((e) => e.photoUri).length;
  }, [entries]);

  // 最常做的活动 Top 5
  const topActivities = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach((e) => {
      if (e.activities) {
        try {
          const acts = JSON.parse(e.activities) as string[];
          acts.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });
        } catch {}
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => {
        const opt = ACTIVITY_OPTIONS.find((o) => o.id === id);
        return { id, count, icon: opt?.icon || '📌', label: opt?.label || id };
      });
  }, [filteredEntries]);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCircles}>
          {[MoodColors.happy, MoodColors.good, Colors.primary].map((c, i) => (
            <View key={i} style={[styles.emptyCircle, { backgroundColor: c, opacity: 0.7 - i * 0.15 }]} />
          ))}
        </View>
        <Text style={styles.emptyTitle}>还没有统计数据</Text>
        <Text style={styles.emptyHint}>记录更多心情后，这里会展示你的心情趋势</Text>
      </View>
    );
  }

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 时段选择器 */}
      <View style={styles.periodSelector}>
        {(['week', 'month', 'all'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodButton, period === p ? styles.periodButtonActive : undefined]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[styles.periodText, period === p ? styles.periodTextActive : undefined]}
            >
              {p === 'week' ? '本周' : p === 'month' ? '本月' : '全部'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 心情日历 */}
      <MoodCalendar entries={entries} onDayPress={handleDayPress} />

      {/* 总览数据行 */}
      <View style={styles.overviewRow}>
        <OverviewCard
          value={totalCount.toString()}
          label="总记录"
          color={Colors.primary}
        />
        <OverviewCard
          value={streakDays.toString()}
          label="连续天数"
          color={MoodColors.happy}
        />
        <OverviewCard
          value={uniqueDays.toString()}
          label="活跃天"
          color={MoodColors.good}
        />
        <OverviewCard
          value={photoCount.toString()}
          label="照片"
          color={MoodColors.neutral}
        />
      </View>

      {/* 最常见心情 */}
      {topMood && (
        <View style={styles.topMoodCard}>
          <Text style={styles.topMoodLabel}>这段时间你最常感到</Text>
          <View style={styles.topMoodContent}>
            <View style={[styles.topMoodCircle, { backgroundColor: MoodColors[topMood.type as MoodType] + '18' }]}>
              <Text style={styles.topMoodEmoji}>{topMood.emoji}</Text>
            </View>
            <View>
              <Text style={[styles.topMoodName, { color: MoodColors[topMood.type as MoodType] }]}>
                {topMood.label}
              </Text>
              <Text style={styles.topMoodCount}>
                {moodCounts[topMood.type]} 次 ({totalCount > 0 ? Math.round((moodCounts[topMood.type] / totalCount) * 100) : 0}%)
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 7天趋势 */}
      <MoodChart entries={entries} />

      {/* 心情分布 */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>心情分布</Text>
        {MOOD_OPTIONS.map((mood) => {
          const count = moodCounts[mood.type] || 0;
          const pct = totalCount > 0 ? (count / maxCount) * 100 : 0;
          const displayPct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          return (
            <View key={mood.type} style={styles.barRow}>
              <Text style={styles.barEmoji}>{mood.emoji}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(pct, count > 0 ? 5 : 0)}%`,
                      backgroundColor: MoodColors[mood.type as MoodType],
                    },
                  ]}
                />
              </View>
              <Text style={styles.barCount}>
                {count > 0 ? `${displayPct}%` : '-'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 年度像素 — Pixels/Year in Color 风格 */}
      <YearPixels entries={entries} />

      {/* 最常做的活动 */}
      {topActivities.length > 0 && (
        <View style={styles.activitiesCard}>
          <Text style={styles.chartTitle}>常见活动</Text>
          {topActivities.map((act, i) => (
            <View key={act.id} style={styles.activityRow}>
              <Text style={styles.activityRank}>{i + 1}</Text>
              <Text style={styles.activityIcon}>{act.icon}</Text>
              <Text style={styles.activityLabel}>{act.label}</Text>
              <Text style={styles.activityCount}>{act.count}次</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>

    <EntryDetail
      entry={selectedDayEntry}
      onClose={() => setSelectedDayEntry(null)}
    />
    </>
  );
};

// 小概览卡片组件
const OverviewCard = ({ value, label, color }: { value: string; label: string; color: string }) => (
  <View style={styles.overviewCard}>
    <View style={[styles.overviewDot, { backgroundColor: color }]} />
    <Text style={styles.overviewValue}>{value}</Text>
    <Text style={styles.overviewLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 40,
  },
  emptyCircles: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 4,
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
  // 时段选择
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  // 总览行
  overviewRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 3,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  overviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  overviewLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  // 最常见心情
  topMoodCard: {
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
  topMoodLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  topMoodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topMoodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  topMoodEmoji: {
    fontSize: 26,
  },
  topMoodName: {
    fontSize: 18,
    fontWeight: '700',
  },
  topMoodCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // 心情分布
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barEmoji: {
    fontSize: 22,
    width: 32,
  },
  barTrack: {
    flex: 1,
    height: 20,
    backgroundColor: Colors.background,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  barCount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    width: 36,
    textAlign: 'right',
  },
  // 活动统计
  activitiesCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  activityRank: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    width: 20,
  },
  activityIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  activityLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  activityCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
