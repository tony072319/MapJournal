import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MOOD_OPTIONS } from '../constants/moods';
import { Colors } from '../constants/colors';
import { MoodType } from '../types';

interface Props {
  selected: MoodType | null;
  onSelect: (mood: MoodType, emoji: string) => void;
}

export const MoodPicker: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>你现在的心情是？</Text>
      <View style={styles.row}>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selected === mood.type;
          return (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.option,
                isSelected ? {
                  backgroundColor: mood.color + '15',
                  borderColor: mood.color,
                  shadowColor: mood.color,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                } : undefined,
              ]}
              onPress={() => onSelect(mood.type, mood.emoji)}
              activeOpacity={0.7}
            >
              <Text style={[styles.emoji, isSelected ? styles.emojiSelected : undefined]}>
                {mood.emoji}
              </Text>
              <Text
                style={[
                  styles.label,
                  isSelected ? { color: mood.color, fontWeight: '700' } : undefined,
                ]}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 58,
  },
  emoji: {
    fontSize: 30,
  },
  emojiSelected: {
    fontSize: 34,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
});
