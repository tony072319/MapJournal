import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';

interface Props {
  entries: Entry[];
  onDayPress: (date: string, entries: Entry[]) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export const MoodCalendar: React.FC<Props> = ({ entries, onDayPress }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // 当前月的数据
  const calendarData = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDay = startOfMonth.day(); // 0=Sunday
    const daysInMonth = currentMonth.daysInMonth();

    // 该月每天的心情记录
    const dayEntries: Record<string, Entry[]> = {};
    entries.forEach((e) => {
      const dateKey = dayjs(e.createdAt).format('YYYY-MM-DD');
      if (dayjs(dateKey).isSame(currentMonth, 'month')) {
        if (!dayEntries[dateKey]) dayEntries[dateKey] = [];
        dayEntries[dateKey].push(e);
      }
    });

    // 生成日历网格（6行7列）
    const weeks: { day: number; dateKey: string; isCurrentMonth: boolean; isToday: boolean; entries: Entry[] }[][] = [];
    let date = startOfMonth.subtract(startDay, 'day');

    for (let w = 0; w < 6; w++) {
      const week: typeof weeks[0] = [];
      for (let d = 0; d < 7; d++) {
        const dateKey = date.format('YYYY-MM-DD');
        week.push({
          day: date.date(),
          dateKey,
          isCurrentMonth: date.isSame(currentMonth, 'month'),
          isToday: date.isSame(dayjs(), 'day'),
          entries: dayEntries[dateKey] || [],
        });
        date = date.add(1, 'day');
      }
      weeks.push(week);
      // 如果已经过了本月最后一天且是整周结束，可以停止
      if (date.isAfter(endOfMonth) && date.day() === 0) break;
    }

    return { weeks, dayEntries };
  }, [currentMonth, entries]);

  // 本月心情统计
  const monthMoodSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(calendarData.dayEntries).flat().forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    return counts;
  }, [calendarData]);

  const totalThisMonth = Object.values(monthMoodSummary).reduce((a, b) => a + b, 0);

  const goToPrevMonth = () => setCurrentMonth((m) => m.subtract(1, 'month'));
  const goToNextMonth = () => setCurrentMonth((m) => m.add(1, 'month'));
  const goToToday = () => setCurrentMonth(dayjs());

  return (
    <View style={styles.container}>
      {/* 月份导航 */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.monthTitle}>{currentMonth.format('YYYY年M月')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* 本月心情小条 */}
      {totalThisMonth > 0 && (
        <View style={styles.monthSummary}>
          <Text style={styles.summaryLabel}>本月 {totalThisMonth} 条记录</Text>
          <View style={styles.summaryDots}>
            {Object.entries(monthMoodSummary).map(([mood, count]) => (
              <View
                key={mood}
                style={[
                  styles.summaryDot,
                  { backgroundColor: MoodColors[mood as MoodType] || Colors.primary },
                  { width: Math.max(8, Math.min(count * 6, 28)) },
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* 星期标题 */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekdayText}>{d}</Text>
        ))}
      </View>

      {/* 日历网格 */}
      {calendarData.weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((cell) => {
            const hasEntries = cell.entries.length > 0;
            const topMoodColor = hasEntries
              ? MoodColors[cell.entries[0].mood as MoodType] || Colors.primary
              : undefined;

            return (
              <TouchableOpacity
                key={cell.dateKey}
                style={[
                  styles.dayCell,
                  cell.isToday ? styles.dayCellToday : undefined,
                  hasEntries ? styles.dayCellWithEntry : undefined,
                  hasEntries ? { backgroundColor: topMoodColor + '08' } : undefined,
                ]}
                onPress={() => hasEntries ? onDayPress(cell.dateKey, cell.entries) : undefined}
                activeOpacity={hasEntries ? 0.6 : 1}
                disabled={!hasEntries}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    !cell.isCurrentMonth ? styles.dayNumberOutside : undefined,
                    cell.isToday ? styles.dayNumberToday : undefined,
                  ]}
                >
                  {cell.day}
                </Text>
                {/* 心情emoji显示（最多2个） */}
                {hasEntries && (
                  <View style={styles.emojiRow}>
                    {cell.entries.slice(0, 2).map((e, i) => (
                      <Text key={i} style={styles.cellEmoji}>{e.emoji}</Text>
                    ))}
                    {cell.entries.length > 2 && (
                      <Text style={styles.cellMore}>+{cell.entries.length - 2}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // 月份头
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  // 月度概览
  monthSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryDot: {
    height: 6,
    borderRadius: 3,
    marginLeft: 3,
  },
  // 星期标题
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  // 日历行
  weekRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  // 日期格
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    padding: 3,
    margin: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayCellWithEntry: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 2,
    marginTop: 1,
  },
  dayNumberOutside: {
    color: Colors.border,
  },
  dayNumberToday: {
    color: Colors.primary,
    fontWeight: '800',
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 1,
  },
  cellEmoji: {
    fontSize: 12,
  },
  cellMore: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: 1,
  },
});
