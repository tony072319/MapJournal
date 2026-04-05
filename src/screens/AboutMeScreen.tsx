import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { MOOD_OPTIONS } from '../constants/moods';
import { MoodType } from '../types';
import dayjs from 'dayjs';

import { UserProfileCard } from '../components/UserProfileCard';
import { SettingsSection } from '../components/SettingsSection';
import { MoodCalendar } from '../components/MoodCalendar';
import { MoodChart } from '../components/MoodChart';
import { MoodInsight } from '../components/MoodInsight';
import { YearPixels } from '../components/YearPixels';
import { TopLocations } from '../components/TopLocations';
import { LocationMoodCorrelation } from '../components/LocationMoodCorrelation';
import { MoodTimeOfDay } from '../components/MoodTimeOfDay';
import { Achievements } from '../components/Achievements';

export const AboutMeScreen: React.FC = () => {
  const { entries } = useEntries();

  const streakDays = useMemo(() => {
    if (entries.length === 0) return 0;
    const dates = [...new Set(entries.map((e) => dayjs(e.createdAt).format('YYYY-MM-DD')))]
      .sort().reverse();
    let streak = 0;
    let current = dayjs();
    for (const dateStr of dates) {
      if (current.diff(dayjs(dateStr), 'day') <= 1) {
        streak++;
        current = dayjs(dateStr);
      } else break;
    }
    return streak;
  }, [entries]);

  // 心情分布
  const moodCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    MOOD_OPTIONS.forEach((m) => (counts[m.type] = 0));
    entries.forEach((e) => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
    return counts;
  }, [entries]);

  const totalCount = entries.length;
  const maxMoodCount = Math.max(...Object.values(moodCounts), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <UserProfileCard
        entryCount={entries.length}
        friendCount={0}
        streakDays={streakDays}
      />

      <SettingsSection entries={entries} />

      {/* 回忆区域 */}
      {entries.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>回忆</Text>

          {/* 心情分布柱状图 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>心情分布</Text>
            {MOOD_OPTIONS.map((mood) => {
              const count = moodCounts[mood.type] || 0;
              const pct = totalCount > 0 ? Math.max((count / maxMoodCount) * 100, count > 0 ? 5 : 0) : 0;
              const displayPct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <View key={mood.type} style={styles.barRow}>
                  <Text style={styles.barEmoji}>{mood.emoji}</Text>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${pct}%`,
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

          <MoodChart entries={entries} />

          <MoodInsight entries={entries} />

          <TopLocations entries={entries} />

          <LocationMoodCorrelation entries={entries} />

          <MoodTimeOfDay entries={entries} />

          <MoodCalendar entries={entries} onDayPress={() => {}} />

          <YearPixels entries={entries} />

          <Achievements entries={entries} />
        </>
      )}

      {entries.length === 0 && (
        <View style={styles.emptyMemories}>
          <Text style={styles.emptyTitle}>还没有回忆</Text>
          <Text style={styles.emptyHint}>去地图页面记录心情，这里会展示你的心情趋势和洞察</Text>
        </View>
      )}
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
  sectionHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  card: {
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
  cardTitle: {
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
  emptyMemories: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
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
});
