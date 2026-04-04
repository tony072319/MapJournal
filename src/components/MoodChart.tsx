import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { Entry } from '../types';
import dayjs from 'dayjs';

const CHART_HEIGHT = 120;
const DOT_SIZE = 30;

interface Props {
  entries: Entry[];
}

const moodToValue: Record<string, number> = {
  amazing: 8, happy: 7, good: 6, calm: 5, neutral: 4, anxious: 3, sad: 2, angry: 1,
};

const getColorForValue = (val: number): string => {
  if (val >= 7.5) return MoodColors.amazing;
  if (val >= 6.5) return MoodColors.happy;
  if (val >= 5.5) return MoodColors.good;
  if (val >= 4.5) return MoodColors.calm;
  if (val >= 3.5) return MoodColors.neutral;
  if (val >= 2.5) return MoodColors.anxious;
  if (val >= 1.5) return MoodColors.sad;
  return MoodColors.angry;
};

const getEmojiForValue = (val: number): string => {
  if (val >= 7.5) return '🤩';
  if (val >= 6.5) return '😄';
  if (val >= 5.5) return '😊';
  if (val >= 4.5) return '😌';
  if (val >= 3.5) return '😐';
  if (val >= 2.5) return '😰';
  if (val >= 1.5) return '😢';
  return '😠';
};

export const MoodChart: React.FC<Props> = ({ entries }) => {
  const days = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, 'day')
  );

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

  const valueToPixels = (val: number): number => {
    return ((val - 1) / 7) * (CHART_HEIGHT - DOT_SIZE);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>最近7天</Text>
        {!hasData && <Text style={styles.noData}>暂无数据</Text>}
      </View>

      <View style={styles.chartRow}>
        {dailyData.map((val, i) => {
          const isToday = i === 6;
          return (
            <View key={i} style={styles.column}>
              <View style={styles.barArea}>
                {val !== null ? (
                  <>
                    {/* 连接柱 */}
                    <View
                      style={[
                        styles.barStem,
                        {
                          height: valueToPixels(val),
                          backgroundColor: getColorForValue(val) + '25',
                        },
                      ]}
                    />
                    {/* 数据点 */}
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: getColorForValue(val) },
                      ]}
                    >
                      <Text style={styles.dotEmoji}>{getEmojiForValue(val)}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.emptyDot} />
                )}
              </View>
              <Text style={[styles.dayLabel, isToday ? styles.dayLabelToday : undefined]}>
                {isToday ? '今' : days[i].format('dd')}
              </Text>
            </View>
          );
        })}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  noData: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 2,
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
  barStem: {
    width: 8,
    borderRadius: 4,
    marginBottom: -2,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dotEmoji: {
    fontSize: 15,
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 8,
  },
  dayLabelToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
