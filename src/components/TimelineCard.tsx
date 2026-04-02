import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { formatRelative } from '../utils/dateFormat';
import { Entry, MoodType } from '../types';

interface Props {
  entry: Entry;
  onPress: () => void;
}

export const TimelineCard: React.FC<Props> = ({ entry, onPress }) => {
  const mood = getMoodByType(entry.mood);
  const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={`${mood.label}心情记录，${formatRelative(entry.createdAt)}`}
      accessibilityRole="button"
    >
      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        {/* 左侧心情色条 */}
        <View style={[styles.colorStripe, { backgroundColor: moodColor }]} />

        <View style={styles.cardContent}>
          <View style={styles.row}>
            {/* 心情emoji */}
            <View style={[styles.emojiCircle, { borderColor: moodColor, backgroundColor: moodColor + '10' }]}>
              <Text style={styles.emoji}>{entry.emoji}</Text>
            </View>

            {/* 内容 */}
            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text style={[styles.moodLabel, { color: moodColor }]}>
                  {mood.label}
                </Text>
                <Text style={styles.time}>{formatRelative(entry.createdAt)}</Text>
              </View>

              {entry.note && (
                <Text style={styles.note} numberOfLines={2}>
                  {entry.note}
                </Text>
              )}

              {entry.address && (
                <Text style={styles.address} numberOfLines={1}>
                  📍 {entry.address}
                </Text>
              )}
            </View>

            {/* 缩略图 */}
            {entry.photoUri && (
              <Image source={{ uri: entry.photoUri }} style={styles.thumbnail} />
            )}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  colorStripe: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  note: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 2,
  },
  address: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 12,
    marginLeft: 10,
  },
});
