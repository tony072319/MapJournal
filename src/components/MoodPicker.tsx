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
      <Text style={styles.title}>你现在感觉怎么样？</Text>
      {/* 第一行: 4个 */}
      <View style={styles.row}>
        {MOOD_OPTIONS.slice(0, 4).map((mood) => {
          const isSelected = selected === mood.type;
          return (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.option,
                isSelected ? {
                  backgroundColor: mood.color + '15',
                  borderColor: mood.color,
                } : undefined,
              ]}
              onPress={() => onSelect(mood.type, mood.emoji)}
              activeOpacity={0.6}
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
      {/* 第二行: 4个 */}
      <View style={styles.row}>
        {MOOD_OPTIONS.slice(4).map((mood) => {
          const isSelected = selected === mood.type;
          return (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.option,
                isSelected ? {
                  backgroundColor: mood.color + '15',
                  borderColor: mood.color,
                } : undefined,
              ]}
              onPress={() => onSelect(mood.type, mood.emoji)}
              activeOpacity={0.6}
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
    marginBottom: 8,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  emoji: {
    fontSize: 26,
  },
  emojiSelected: {
    fontSize: 30,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
});
