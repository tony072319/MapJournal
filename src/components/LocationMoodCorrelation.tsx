import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { clusterEntriesByLocation } from '../utils/locationCluster';
import { Entry, MoodType } from '../types';

interface Props {
  entries: Entry[];
}

// 地点 × 心情关联 — 每个地点的心情分布
export const LocationMoodCorrelation: React.FC<Props> = ({ entries }) => {
  const data = useMemo(() => {
    const clusters = clusterEntriesByLocation(entries, 200).slice(0, 4);
    return clusters.map((c) => {
      const moodCounts: Record<string, number> = {};
      c.entries.forEach((e) => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      });
      const total = c.entries.length;
      // 转为百分比列表
      const bars = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([mood, count]) => ({
          mood,
          pct: Math.round((count / total) * 100),
          color: MoodColors[mood as MoodType] || Colors.textSecondary,
          emoji: getMoodByType(mood).emoji,
        }));
      return {
        name: c.address || `${c.latitude.toFixed(3)}, ${c.longitude.toFixed(3)}`,
        total,
        bars,
      };
    });
  }, [entries]);

  if (data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>地点 × 心情</Text>
      <Text style={styles.subtitle}>你在不同地方的心情分布</Text>

      {data.map((loc, i) => (
        <View key={i} style={styles.locationBlock}>
          <Text style={styles.locationName} numberOfLines={1}>{loc.name}</Text>
          {/* 堆叠条形图 */}
          <View style={styles.stackedBar}>
            {loc.bars.map((bar, j) => (
              <View
                key={j}
                style={{
                  flex: bar.pct,
                  height: 20,
                  backgroundColor: bar.color,
                  borderTopLeftRadius: j === 0 ? 10 : 0,
                  borderBottomLeftRadius: j === 0 ? 10 : 0,
                  borderTopRightRadius: j === loc.bars.length - 1 ? 10 : 0,
                  borderBottomRightRadius: j === loc.bars.length - 1 ? 10 : 0,
                }}
              />
            ))}
          </View>
          {/* 图例 */}
          <View style={styles.legendRow}>
            {loc.bars.map((bar, j) => (
              <View key={j} style={styles.legendItem}>
                <Text style={styles.legendEmoji}>{bar.emoji}</Text>
                <Text style={styles.legendPct}>{bar.pct}%</Text>
              </View>
            ))}
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
  locationBlock: {
    marginBottom: 14,
  },
  locationName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  stackedBar: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  legendEmoji: {
    fontSize: 12,
    marginRight: 3,
  },
  legendPct: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
