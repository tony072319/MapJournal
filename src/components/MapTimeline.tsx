import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { formatShortDate } from '../utils/dateFormat';
import { Entry, MoodType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 140;

interface Props {
  entries: Entry[];
  onEntryPress: (entry: Entry) => void;
}

// Polarsteps 风格的横向时间轴 — 显示在地图底部面板展开时
export const MapTimeline: React.FC<Props> = ({ entries, onEntryPress }) => {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>心情足迹</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {sorted.map((entry) => {
          const mood = getMoodByType(entry.mood);
          const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;

          return (
            <TouchableOpacity
              key={entry.id}
              style={styles.card}
              onPress={() => onEntryPress(entry)}
              activeOpacity={0.7}
            >
              {/* 照片或彩色背景 */}
              {entry.photoUri ? (
                <Image source={{ uri: entry.photoUri }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardColorBg, { backgroundColor: moodColor + '15' }]}>
                  <Text style={styles.cardBigEmoji}>{entry.emoji}</Text>
                </View>
              )}

              {/* 底部信息 */}
              <View style={styles.cardInfo}>
                <View style={styles.cardInfoRow}>
                  <View style={[styles.cardDot, { backgroundColor: moodColor }]} />
                  <Text style={[styles.cardMood, { color: moodColor }]} numberOfLines={1}>
                    {mood.label}
                  </Text>
                </View>
                {entry.note ? (
                  <Text style={styles.cardNote} numberOfLines={1}>{entry.note}</Text>
                ) : null}
                <Text style={styles.cardDate}>{formatShortDate(entry.createdAt)}</Text>
              </View>

              {/* 照片上的emoji覆盖 */}
              {entry.photoUri ? (
                <View style={styles.emojiOverlay}>
                  <Text style={styles.emojiOverlayText}>{entry.emoji}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
    borderRadius: 14,
    backgroundColor: Colors.card,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: 90,
  },
  cardColorBg: {
    width: CARD_WIDTH,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBigEmoji: {
    fontSize: 36,
  },
  cardInfo: {
    padding: 10,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  cardMood: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  cardNote: {
    fontSize: 11,
    color: Colors.text,
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emojiOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiOverlayText: {
    fontSize: 14,
  },
});
