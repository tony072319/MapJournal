import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';

const CHART_HEIGHT = 140;
const DOT_SIZE = 32;

interface Props {
  entries: Entry[];
}

// 心情类型对应数值
const moodToValue: Record<string, number> = {
  happy: 5,
  good: 4,
  neutral: 3,
  sad: 2,
  angry: 1,
};

const getColorForValue = (val: number): string => {
  if (val >= 4.5) return MoodColors.happy;
  if (val >= 3.5) return MoodColors.good;
  if (val >= 2.5) return MoodColors.neutral;
  if (val >= 1.5) return MoodColors.sad;
  return MoodColors.angry;
};

const getEmojiForValue = (val: number): string => {
  if (val >= 4.5) return '😄';
  if (val >= 3.5) return '😊';
  if (val >= 2.5) return '😐';
  if (val >= 1.5) return '😢';
  return '😠';
};

export const MoodChart: React.FC<Props> = ({ entries }) => {
  // 生成最近7天
  const days = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, 'day')
  );

  // 每天的平均心情值
  const dailyData = days.map((day) => {
    const dayEntries = entries.filter((e) =>
      dayjs(e.createdAt).isSame(day, 'day')
    );
    if (dayEntries.length === 0) return null;
    const sum = dayEntries.reduce(
      (acc, e) => acc + (moodToValue[e.mood] || 3),
      0
    );
    return sum / dayEntries.length;
  });

  const hasData = dailyData.some((v) => v !== null);

  // 将值转为从底部的像素偏移
  const valueToPixels = (val: number): number => {
    return ((val - 1) / 4) * (CHART_HEIGHT - DOT_SIZE);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>最近7天心情趋势</Text>

      <View style={styles.chartRow}>
        {dailyData.map((val, i) => (
          <View key={i} style={styles.column}>
            {/* 数据柱/点 */}
            <View style={styles.barArea}>
              {val !== null ? (
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: getColorForValue(val),
                      marginBottom: valueToPixels(val),
                    },
                  ]}
                >
                  <Text style={styles.dotEmoji}>{getEmojiForValue(val)}</Text>
                </View>
              ) : (
                <View style={styles.emptyDot}>
                  <Text style={styles.emptyDash}>-</Text>
                </View>
              )}
            </View>
            {/* 日期标签 */}
            <Text style={styles.dayLabel}>{days[i].format('dd')}</Text>
          </View>
        ))}
      </View>

      {!hasData && (
        <Text style={styles.noDataText}>最近7天还没有记录</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  column: {
    alignItems: 'center',
    flex: 1,
  },
  barArea: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dotEmoji: {
    fontSize: 16,
  },
  emptyDot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  emptyDash: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dayLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 8,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
