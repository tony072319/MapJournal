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
  const allActive = activeFilters.length === 0;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {/* 全部按钮 */}
      <TouchableOpacity
        style={[styles.chip, allActive ? styles.chipActive : undefined]}
        onPress={onClear}
      >
        <Text style={[styles.chipLabel, allActive ? styles.chipLabelActive : undefined]}>全部</Text>
      </TouchableOpacity>

      {/* 各心情筛选按钮 */}
      {MOOD_OPTIONS.map((mood) => {
        const isActive = activeFilters.includes(mood.type);
        return (
          <TouchableOpacity
            key={mood.type}
            style={[
              styles.chip,
              isActive ? { backgroundColor: mood.color + '18', borderColor: mood.color } : undefined,
            ]}
            onPress={() => onToggle(mood.type)}
          >
            <Text style={styles.chipEmoji}>{mood.emoji}</Text>
            <Text style={[styles.chipLabel, isActive ? { color: mood.color } : undefined]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginRight: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chipActive: {
    backgroundColor: Colors.primary + '12',
    borderColor: Colors.primary,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 5,
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
