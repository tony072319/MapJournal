import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { Entry, MoodType } from '../types';
import dayjs from 'dayjs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  entries: Entry[];
  onDayPress?: (date: string) => void;
}

// Pixels / Year in Color 风格 — 每一天一个彩色方块
export const YearPixels: React.FC<Props> = ({ entries, onDayPress }) => {
  const [year, setYear] = useState(dayjs().year());

  const CELL_SIZE = Math.floor((SCREEN_WIDTH - 80) / 12); // 12个月
  const MAX_DAYS = 31;

  // 构建年度数据：月->日->心情颜色
  const yearData = useMemo(() => {
    const data: Record<string, string> = {}; // "MM-DD" -> color
    entries.forEach((e) => {
      const d = dayjs(e.createdAt);
      if (d.year() === year) {
        const key = d.format('MM-DD');
        // 取当天第一条记录的心情颜色
        if (!data[key]) {
          data[key] = MoodColors[e.mood as MoodType] || Colors.textSecondary;
        }
      }
    });
    return data;
  }, [entries, year]);

  const totalDays = Object.keys(yearData).length;

  return (
    <View style={styles.container}>
      {/* 头部 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setYear(year - 1)}>
          <Text style={styles.navText}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setYear(dayjs().year())}>
          <Text style={styles.yearTitle}>{year} 年度心情</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setYear(year + 1)}>
          <Text style={styles.navText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {totalDays > 0 && (
        <Text style={styles.subtitle}>{totalDays} 天有记录</Text>
      )}

      {/* 月份标签 */}
      <View style={styles.monthLabels}>
        {Array.from({ length: 12 }, (_, i) => (
          <Text key={i} style={[styles.monthLabel, { width: CELL_SIZE }]}>
            {i + 1}
          </Text>
        ))}
      </View>

      {/* 像素网格：行=天(1-31)，列=月(1-12) */}
      <View style={styles.grid}>
        {Array.from({ length: MAX_DAYS }, (_, day) => (
          <View key={day} style={styles.row}>
            {/* 日期标签 */}
            <Text style={styles.dayLabel}>
              {(day + 1) % 5 === 0 ? day + 1 : ''}
            </Text>
            {Array.from({ length: 12 }, (_, month) => {
              const dateKey = `${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`;
              const color = yearData[dateKey];
              const isToday = dayjs().format('MM-DD') === dateKey && year === dayjs().year();
              // 检查这个日期是否存在（2月没有31日等）
              const dateValid = dayjs(`${year}-${dateKey}`).isValid() &&
                dayjs(`${year}-${dateKey}`).date() === day + 1;

              if (!dateValid) {
                return <View key={month} style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE, opacity: 0 }]} />;
              }

              return (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.cell,
                    {
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: color || (isToday ? Colors.primary + '20' : Colors.border + '40'),
                    },
                    isToday ? styles.cellToday : undefined,
                  ]}
                  onPress={() => color && onDayPress?.(`${year}-${dateKey}`)}
                  disabled={!color}
                  activeOpacity={0.6}
                />
              );
            })}
          </View>
        ))}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  navText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    padding: 8,
  },
  yearTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  monthLabels: {
    flexDirection: 'row',
    marginLeft: 20,
    marginBottom: 4,
  },
  monthLabel: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  grid: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabel: {
    width: 18,
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginRight: 2,
  },
  cell: {
    borderRadius: 2,
    margin: 0.5,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
});
