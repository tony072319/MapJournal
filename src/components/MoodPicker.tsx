import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MOOD_OPTIONS } from '../constants/moods';
import { Colors, MoodColors } from '../constants/colors';
import { MoodType } from '../types';

interface Props {
  selected: MoodType | null;
  onSelect: (mood: MoodType, emoji: string) => void;
  compact?: boolean;
}

/**
 * MoodPicker — grid of 8 moods. Selected one gets its color as background
 * and a scale bump. Compact mode shrinks for inline contexts.
 */
export const MoodPicker: React.FC<Props> = ({ selected, onSelect, compact }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {MOOD_OPTIONS.map((m) => {
          const sel = selected === m.type;
          return (
            <TouchableOpacity
              key={m.type}
              onPress={() => onSelect(m.type, m.emoji)}
              activeOpacity={0.75}
              style={[
                styles.cell,
                compact && styles.cellCompact,
                sel && {
                  backgroundColor: MoodColors[m.type],
                  transform: [{ scale: 1.06 }],
                },
              ]}
            >
              <Text style={[styles.emoji, { fontSize: sel ? (compact ? 22 : 28) : (compact ? 18 : 22) }]}>
                {m.emoji}
              </Text>
              {sel && !compact && (
                <Text style={styles.label}>{m.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {!compact && (
        <View style={styles.scaleRow}>
          <Text style={styles.scaleLabel}>BEST · 超棒</Text>
          <Text style={styles.scaleLabel}>WORST · 最差</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { flexDirection: 'row', gap: 3 },
  cell: {
    flex: 1, aspectRatio: 1, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', gap: 2,
  },
  cellCompact: { aspectRatio: 1, borderRadius: 10 },
  emoji: { textAlign: 'center' },
  label: {
    color: '#FFFFFF', fontSize: 9, fontWeight: '700', letterSpacing: 0.3,
  },
  scaleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 8, paddingHorizontal: 4,
  },
  scaleLabel: {
    fontFamily: 'Menlo', fontSize: 9,
    color: Colors.muted, letterSpacing: 1.5,
  },
});
