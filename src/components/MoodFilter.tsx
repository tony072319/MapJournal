import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MOOD_OPTIONS } from '../constants/moods';
import { Colors } from '../constants/colors';
import { MoodType } from '../types';

interface Props {
  activeFilters: MoodType[];
  onToggle: (mood: MoodType) => void;
  onClear: () => void;
}

export const MoodFilter: React.FC<Props> = ({ activeFilters, onToggle, onClear }) => {
  const allActive = activeFilters.length === 0; // 空数组 = 显示全部

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 全部按钮 */}
        <TouchableOpacity
          style={[styles.chip, allActive && styles.chipAllActive]}
          onPress={onClear}
          accessibilityLabel="显示全部心情"
          accessibilityRole="button"
        >
          <Text style={[styles.chipLabel, allActive && styles.chipLabelActive]}>全部</Text>
        </TouchableOpacity>

        {/* 各心情筛选按钮 */}
        {MOOD_OPTIONS.map((mood) => {
          const isActive = activeFilters.includes(mood.type);
          return (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.chip,
                isActive && { backgroundColor: mood.color + '20', borderColor: mood.color },
              ]}
              onPress={() => onToggle(mood.type)}
              accessibilityLabel={`筛选${mood.label}心情`}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={styles.chipEmoji}>{mood.emoji}</Text>
              <Text style={[styles.chipLabel, isActive && { color: mood.color }]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipAllActive: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipLabelActive: {
    color: Colors.primary,
  },
});
