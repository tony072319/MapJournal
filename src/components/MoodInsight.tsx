import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { ACTIVITY_OPTIONS } from '../constants/activities';
import { Entry, MoodType } from '../types';

interface Props {
  entries: Entry[];
}

const moodToValue: Record<string, number> = {
  amazing: 8, happy: 7, good: 6, calm: 5, neutral: 4, anxious: 3, sad: 2, angry: 1,
};

// Daylio 风格的"心情洞察"
// 分析哪些活动和好心情相关，哪些和坏心情相关
export const MoodInsight: React.FC<Props> = ({ entries }) => {
  const insights = useMemo(() => {
    if (entries.length < 3) return [];

    // 计算每个活动的平均心情值
    const activityMoods: Record<string, { total: number; count: number }> = {};
    const overallTotal = entries.reduce((sum, e) => sum + (moodToValue[e.mood] || 4), 0);
    const overallAvg = overallTotal / entries.length;

    entries.forEach((e) => {
      if (e.activities) {
        try {
          const acts = JSON.parse(e.activities) as string[];
          acts.forEach((a) => {
            if (!activityMoods[a]) activityMoods[a] = { total: 0, count: 0 };
            activityMoods[a].total += moodToValue[e.mood] || 4;
            activityMoods[a].count += 1;
          });
        } catch {}
      }
    });

    // 找出正向和负向关联
    const results: { id: string; icon: string; label: string; avgMood: number; diff: number; positive: boolean }[] = [];

    Object.entries(activityMoods).forEach(([id, data]) => {
      if (data.count < 2) return; // 至少出现2次才有统计意义
      const avg = data.total / data.count;
      const diff = avg - overallAvg;
      const opt = ACTIVITY_OPTIONS.find((o) => o.id === id);
      if (Math.abs(diff) > 0.3) { // 差异需要大于0.3才显示
        results.push({
          id,
          icon: opt?.icon || '📌',
          label: opt?.label || id,
          avgMood: avg,
          diff,
          positive: diff > 0,
        });
      }
    });

    // 按差异绝对值排序
    return results.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 3);
  }, [entries]);

  if (insights.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>心情洞察 💡</Text>
      <Text style={styles.subtitle}>基于你的记录发现的规律</Text>

      {insights.map((insight) => (
        <View key={insight.id} style={styles.insightRow}>
          <Text style={styles.insightIcon}>{insight.icon}</Text>
          <View style={styles.insightContent}>
            <Text style={styles.insightText}>
              {insight.positive
                ? `${insight.label}的时候，你的心情通常更好`
                : `${insight.label}的时候，你的心情通常较低`}
            </Text>
            <View style={[
              styles.insightBadge,
              { backgroundColor: insight.positive ? MoodColors.good + '20' : MoodColors.sad + '20' },
            ]}>
              <Text style={[
                styles.insightBadgeText,
                { color: insight.positive ? MoodColors.good : MoodColors.sad },
              ]}>
                {insight.positive ? '↑' : '↓'} {Math.round(Math.abs(insight.diff) / 7 * 100)}%
              </Text>
            </View>
          </View>
        </View>
      ))}
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
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
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
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  insightIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
  insightBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  insightBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
