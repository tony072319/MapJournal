import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MOOD_OPTIONS } from '../constants/moods';
import { Colors } from '../constants/colors';
import { MoodType } from '../types';

interface Props {
  selected: MoodType | null;
  onSelect: (mood: MoodType, emoji: string) => void;
}

const MoodButton = ({
  mood,
  isSelected,
  onPress,
}: {
  mood: (typeof MOOD_OPTIONS)[0];
  isSelected: boolean;
  onPress: () => void;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    // 弹跳动画
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`心情：${mood.label}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <Animated.View
        style={[
          styles.option,
          isSelected && {
            backgroundColor: mood.color + '20',
            borderColor: mood.color,
            shadowColor: mood.color,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 4,
          },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[styles.emoji, isSelected && styles.emojiSelected]}>
          {mood.emoji}
        </Text>
        <Text
          style={[styles.label, isSelected && { color: mood.color, fontWeight: '700' }]}
        >
          {mood.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const MoodPicker: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>你现在的心情是？</Text>
      <View style={styles.row}>
        {MOOD_OPTIONS.map((mood) => (
          <MoodButton
            key={mood.type}
            mood={mood}
            isSelected={selected === mood.type}
            onPress={() => onSelect(mood.type, mood.emoji)}
          />
        ))}
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
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 2.5,
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
    marginTop: 6,
    fontWeight: '500',
  },
});
