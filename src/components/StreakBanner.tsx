import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { Entry } from '../types';
import dayjs from 'dayjs';

interface Props {
  entries: Entry[];
}

export const StreakBanner: React.FC<Props> = ({ entries }) => {
  const { streak, todayRecorded } = useMemo(() => {
    if (entries.length === 0) return { streak: 0, todayRecorded: false };

    const dates = [...new Set(entries.map((e) => dayjs(e.createdAt).format('YYYY-MM-DD')))]
      .sort()
      .reverse();

    const hasToday = dates[0] === dayjs().format('YYYY-MM-DD');
    let count = 0;
    let current = dayjs();

    for (const dateStr of dates) {
      const diff = current.diff(dayjs(dateStr), 'day');
      if (diff <= 1) {
        count++;
        current = dayjs(dateStr);
      } else break;
    }

    return { streak: count, todayRecorded: hasToday };
  }, [entries]);

  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD');
      const entry = entries.find((e) => dayjs(e.createdAt).format('YYYY-MM-DD') === date);
      return { date, hasEntry: !!entry, emoji: entry?.emoji };
    });
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.streakRow}>
        <Text style={styles.fireEmoji}>{streak >= 3 ? '🔥' : '📝'}</Text>
        <View>
          <Text style={styles.streakNumber}>
            {streak > 0 ? `${streak} 天连续记录` : '今天还没记录'}
          </Text>
          {!todayRecorded && streak > 0 ? (
            <Text style={styles.streakHint}>记录一下保持连续！</Text>
          ) : null}
          {todayRecorded ? (
            <Text style={styles.streakDone}>今天已打卡 ✓</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.weekDots}>
        {last7.map((day, i) => (
          <View key={i} style={styles.weekDay}>
            <View
              style={[
                styles.weekDot,
                day.hasEntry ? styles.weekDotFilled : undefined,
              ]}
            >
              {day.hasEntry && day.emoji ? (
                <Text style={styles.weekDotEmoji}>{day.emoji}</Text>
              ) : null}
            </View>
            <Text style={styles.weekDayLabel}>
              {i === 6 ? '今' : dayjs().subtract(6 - i, 'day').format('dd')}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fireEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  streakHint: {
    fontSize: 12,
    color: MoodColors.anxious,
    fontWeight: '500',
  },
  streakDone: {
    fontSize: 12,
    color: MoodColors.good,
    fontWeight: '500',
  },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    alignItems: 'center',
  },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekDotFilled: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  weekDotEmoji: {
    fontSize: 14,
  },
  weekDayLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
