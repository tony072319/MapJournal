import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { MOOD_OPTIONS } from '../constants/moods';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';

interface Props {
  entries: Entry[];
}

// 最近7天每天的心情平均值折线图（纯RN绘制，无第三方图表库）
export const MoodChart: React.FC<Props> = ({ entries }) => {
  // 生成最近7天的日期
  const days = Array.from({ length: 7 }, (_, i) =>
    dayjs().subtract(6 - i, 'day')
  );

  // 心情类型对应数值：happy=5, good=4, neutral=3, sad=2, angry=1
  const moodToValue: Record<string, number> = {
    happy: 5,
    good: 4,
    neutral: 3,
    sad: 2,
    angry: 1,
  };

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

  const chartHeight = 120;
  const chartWidth = '100%';
  const minVal = 1;
  const maxVal = 5;

  // 将数值转为Y坐标百分比
  const valueToY = (val: number) => {
    return ((val - minVal) / (maxVal - minVal)) * 100;
  };

  // 找出有数据的连续点用于画线
  const points = dailyData
    .map((val, i) => (val !== null ? { x: i, y: valueToY(val), val } : null))
    .filter(Boolean) as { x: number; y: number; val: number }[];

  // 心情值对应的颜色
  const getColorForValue = (val: number): string => {
    if (val >= 4.5) return MoodColors.happy;
    if (val >= 3.5) return MoodColors.good;
    if (val >= 2.5) return MoodColors.neutral;
    if (val >= 1.5) return MoodColors.sad;
    return MoodColors.angry;
  };

  // 心情值对应的emoji
  const getEmojiForValue = (val: number): string => {
    if (val >= 4.5) return '😄';
    if (val >= 3.5) return '😊';
    if (val >= 2.5) return '😐';
    if (val >= 1.5) return '😢';
    return '😠';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>最近7天心情趋势</Text>

      {/* 图表区域 */}
      <View style={styles.chartArea}>
        {/* 背景横线 */}
        {[1, 2, 3, 4, 5].map((level) => (
          <View
            key={level}
            style={[
              styles.gridLine,
              { bottom: `${valueToY(level)}%` },
            ]}
          />
        ))}

        {/* 数据点 */}
        {dailyData.map((val, i) => {
          if (val === null) return null;
          const color = getColorForValue(val);
          return (
            <View
              key={i}
              style={[
                styles.dotContainer,
                {
                  left: `${(i / 6) * 100}%`,
                  bottom: `${valueToY(val)}%`,
                },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: color }]}>
                <Text style={styles.dotEmoji}>{getEmojiForValue(val)}</Text>
              </View>
            </View>
          );
        })}

        {/* 连接线（简化版：用虚线点暗示趋势） */}
        {points.length >= 2 &&
          points.slice(0, -1).map((point, i) => {
            const next = points[i + 1];
            // 简单用一条视觉线连接
            return (
              <View
                key={`line-${i}`}
                style={[
                  styles.connectionLine,
                  {
                    left: `${(point.x / 6) * 100}%`,
                    bottom: `${Math.min(point.y, next.y)}%`,
                    width: `${((next.x - point.x) / 6) * 100}%`,
                    height: Math.abs(next.y - point.y) || 2,
                    backgroundColor: Colors.border,
                  },
                ]}
              />
            );
          })}
      </View>

      {/* X轴：日期标签 */}
      <View style={styles.xAxis}>
        {days.map((day, i) => (
          <Text key={i} style={styles.dayLabel}>
            {day.format('dd')}
          </Text>
        ))}
      </View>

      {/* 无数据提示 */}
      {points.length === 0 && (
        <View style={styles.noDataOverlay}>
          <Text style={styles.noDataText}>最近7天还没有记录</Text>
        </View>
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
  chartArea: {
    height: 140,
    position: 'relative',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.4,
  },
  dotContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -16,
    marginBottom: -16,
    width: 32,
    height: 32,
    zIndex: 10,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  connectionLine: {
    position: 'absolute',
    opacity: 0.3,
    zIndex: 1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    width: 32,
    textAlign: 'center',
  },
  noDataOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
