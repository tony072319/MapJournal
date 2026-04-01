import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MoodColors } from '../constants/colors';
import { MoodType } from '../types';

interface Props {
  mood: MoodType;
  emoji: string;
}

export const MoodMarker: React.FC<Props> = ({ mood, emoji }) => {
  const borderColor = MoodColors[mood] || MoodColors.neutral;

  return (
    <View style={[styles.container, { borderColor }]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emoji: {
    fontSize: 20,
  },
});
