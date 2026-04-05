import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { clusterEntriesByLocation } from '../utils/locationCluster';
import { Entry, MoodType } from '../types';
import { formatRelative } from '../utils/dateFormat';

interface Props {
  entries: Entry[];
}

export const TopLocations: React.FC<Props> = ({ entries }) => {
  const topClusters = useMemo(() => {
    return clusterEntriesByLocation(entries, 200).slice(0, 5);
  }, [entries]);

  if (topClusters.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>最常去的地点</Text>

      {topClusters.map((cluster, i) => {
        // 计算该地点的心情分布
        const moodCounts: Record<string, number> = {};
        cluster.entries.forEach((e) => {
          moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
        });
        const total = cluster.entries.length;

        return (
          <View key={i} style={styles.locationRow}>
            <Text style={styles.rank}>{i + 1}</Text>
            <View style={styles.locationContent}>
              <Text style={styles.locationName} numberOfLines={1}>
                {cluster.address || `${cluster.latitude.toFixed(3)}, ${cluster.longitude.toFixed(3)}`}
              </Text>
              <Text style={styles.locationMeta}>
                {total} 次访问 · 最近 {formatRelative(cluster.entries[0].createdAt)}
              </Text>
              {/* 心情分布条 */}
              <View style={styles.moodBar}>
                {Object.entries(moodCounts).map(([mood, count]) => (
                  <View
                    key={mood}
                    style={{
                      flex: count,
                      height: 4,
                      backgroundColor: MoodColors[mood as MoodType] || Colors.textSecondary,
                      borderRadius: 2,
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        );
      })}
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
    marginBottom: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rank: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    width: 22,
    marginTop: 2,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  locationMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  moodBar: {
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
  },
});
