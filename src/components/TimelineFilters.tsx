import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { MoodFilter } from './MoodFilter';
import { Entry, MoodType } from '../types';

type Period = 'all' | 'week' | 'month';

interface Props {
  entries: Entry[];
  // 时段
  period: Period;
  onPeriodChange: (p: Period) => void;
  // 城市
  selectedCity: string | null;
  onCityChange: (city: string | null) => void;
  // 心情
  moodFilters: MoodType[];
  onMoodToggle: (mood: MoodType) => void;
  onMoodClear: () => void;
}

export const TimelineFilters: React.FC<Props> = ({
  entries,
  period, onPeriodChange,
  selectedCity, onCityChange,
  moodFilters, onMoodToggle, onMoodClear,
}) => {
  // 从 entries 提取去重城市
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    entries.forEach((e) => {
      if (e.address) {
        // 尝试提取城市名（最后一个逗号后的部分，或整个地址）
        const parts = e.address.split(',').map((s) => s.trim());
        const city = parts[parts.length - 1] || parts[0];
        if (city) citySet.add(city);
      }
    });
    return Array.from(citySet).sort();
  }, [entries]);

  return (
    <View style={styles.container}>
      {/* 时段筛选 */}
      <View style={styles.periodRow}>
        {(['all', 'week', 'month'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, period === p ? styles.periodChipActive : undefined]}
            onPress={() => onPeriodChange(p)}
          >
            <Text style={[styles.periodText, period === p ? styles.periodTextActive : undefined]}>
              {p === 'all' ? '全部' : p === 'week' ? '本周' : '本月'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 城市筛选 */}
      {cities.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
          <TouchableOpacity
            style={[styles.cityChip, selectedCity === null ? styles.cityChipActive : undefined]}
            onPress={() => onCityChange(null)}
          >
            <Text style={[styles.cityText, selectedCity === null ? styles.cityTextActive : undefined]}>
              所有地点
            </Text>
          </TouchableOpacity>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.cityChip, selectedCity === city ? styles.cityChipActive : undefined]}
              onPress={() => onCityChange(selectedCity === city ? null : city)}
            >
              <Text style={[styles.cityText, selectedCity === city ? styles.cityTextActive : undefined]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 心情筛选 */}
      <MoodFilter
        activeFilters={moodFilters}
        onToggle={onMoodToggle}
        onClear={onMoodClear}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  periodRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  cityScroll: {
    marginBottom: 10,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityChipActive: {
    backgroundColor: Colors.primary + '12',
    borderColor: Colors.primary,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cityTextActive: {
    color: Colors.primary,
  },
});
