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
                isSelected && { backgroundColor: mood.color + '20', borderColor: mood.color },
              ]}
              onPress={() => onSelect(mood.type, mood.emoji)}
              activeOpacity={0.7}
            >
              <Text style={[styles.emoji, isSelected && styles.emojiSelected]}>
                {mood.emoji}
              </Text>
              <Text
                style={[styles.label, isSelected && { color: mood.color }]}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
  },
  emoji: {
    fontSize: 32,
  },
  emojiSelected: {
    fontSize: 36,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});
