import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { formatRelative, formatShortDate } from '../utils/dateFormat';
import { Entry, MoodType } from '../types';

interface Props {
  entry: Entry;
  onPress: () => void;
}

export const TimelineCard: React.FC<Props> = ({ entry, onPress }) => {
  const mood = getMoodByType(entry.mood);
  const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        {/* 心情emoji */}
        <View style={[styles.emojiCircle, { borderColor: moodColor }]}>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: Colors.background,
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
    fontWeight: '600',
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
    width: 50,
    height: 50,
    borderRadius: 10,
    marginLeft: 10,
  },
});
