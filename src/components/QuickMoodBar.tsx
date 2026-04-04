import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { MOOD_OPTIONS } from '../constants/moods';
import { Colors, MoodColors } from '../constants/colors';
import { useEntries } from '../context/EntriesContext';
import { MoodType, UserLocation } from '../types';
import * as Location from 'expo-location';

interface Props {
  location: UserLocation;
  onFullEntry: () => void; // 打开完整记录面板
  onSaved: () => void;
}

// 快速心情记录 — 灵感来自 Daylio 的一键记录
// 用户可以直接点一个emoji快速记录，或者点"更多"打开完整表单
export const QuickMoodBar: React.FC<Props> = ({ location, onFullEntry, onSaved }) => {
  const { addEntry } = useEntries();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleQuickSave = async (mood: MoodType, emoji: string) => {
    if (saving) return;
    setSaving(mood);

    try {
      // 尝试获取地址
      let address: string | undefined;
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        if (results.length > 0) {
          const r = results[0];
          const parts = [r.name, r.street, r.city].filter(Boolean);
          if (parts.length > 0) address = parts.join(', ');
        }
      } catch {}

      await addEntry({
        mood,
        emoji,
        latitude: location.latitude,
        longitude: location.longitude,
        address,
      });

      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Quick save failed:', e);
    } finally {
      setSaving(null);
    }
  };

  if (saved) {
    return (
      <View style={styles.container}>
        <View style={styles.savedBanner}>
          <Text style={styles.savedText}>已记录 ✓</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.prompt}>现在感觉怎么样？</Text>
      <View style={styles.emojiRow}>
        {MOOD_OPTIONS.slice(0, 5).map((mood) => (
          <TouchableOpacity
            key={mood.type}
            style={[
              styles.emojiButton,
              saving === mood.type ? { backgroundColor: mood.color + '20' } : undefined,
            ]}
            onPress={() => handleQuickSave(mood.type, mood.emoji)}
            activeOpacity={0.6}
            disabled={saving !== null}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={onFullEntry}
          activeOpacity={0.7}
        >
          <Text style={styles.moreText}>...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  prompt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
  },
  emoji: {
    fontSize: 26,
  },
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    marginLeft: 4,
  },
  moreText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  savedBanner: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  savedText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.success,
  },
});
