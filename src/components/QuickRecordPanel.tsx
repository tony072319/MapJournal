import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { MOOD_OPTIONS } from '../constants/moods';
import { Colors, MoodColors } from '../constants/colors';
import { useEntries } from '../context/EntriesContext';
import { VoiceMemoButton } from './VoiceMemoButton';
import { MoodType, UserLocation } from '../types';
import * as Location from 'expo-location';

interface Props {
  location: UserLocation;
  onFullEntry: () => void;
  onSaved: () => void;
}

/**
 * Composer — editorial glass card
 * - Thin location strip up top
 * - 8 mood pills (equal flex, selected gets label)
 * - Input row + mic + send
 */
export const QuickRecordPanel: React.FC<Props> = ({ location, onFullEntry, onSaved }) => {
  const { addEntry } = useEntries();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [note, setNote] = useState('');
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const canSave = selectedMood !== null;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      let address: string | undefined;
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: location.latitude, longitude: location.longitude,
        });
        if (results.length > 0) {
          const r = results[0];
          const parts = [r.name, r.street, r.city].filter(Boolean);
          if (parts.length > 0) address = parts.join(', ');
        }
      } catch {}
      await addEntry({
        mood: selectedMood, emoji: selectedEmoji,
        note: note.trim() || undefined,
        voiceUri: voiceUri || undefined,
        latitude: location.latitude, longitude: location.longitude,
        address,
      });
      setSaved(true);
      setSelectedMood(null); setSelectedEmoji('');
      setNote(''); setVoiceUri(null);
      onSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('保存失败:', e);
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <View style={styles.container}>
        <Text style={styles.savedText}>已记录 ✓</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* location strip */}
      <View style={styles.locationStrip}>
        <View style={styles.locationDot} />
        <Text style={styles.locationText} numberOfLines={1}>
          你在 · {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      </View>

      {/* mood row — all 8, equal */}
      <View style={styles.moodRow}>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood === mood.type;
          const c = MoodColors[mood.type];
          return (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.moodCell,
                isSelected && {
                  backgroundColor: c + '22',
                  borderColor: c,
                },
              ]}
              onPress={() => {
                setSelectedMood(mood.type);
                setSelectedEmoji(mood.emoji);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              {isSelected && (
                <Text style={[styles.moodLabelSel, { color: c }]}>{mood.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* input + send */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="写下这一刻…"
          placeholderTextColor={Colors.muted}
          value={note}
          onChangeText={setNote}
          maxLength={200}
        />
        <View style={styles.micBtn}>
          <VoiceMemoButton
            voiceUri={voiceUri}
            onRecorded={setVoiceUri}
            onClear={() => setVoiceUri(null)}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendBtn, !canSave && styles.sendBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.7}
        >
          <Text style={styles.sendText}>{saving ? '...' : '＋'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.moreBtn} onPress={onFullEntry} activeOpacity={0.6}>
        <Text style={styles.moreText}>更多选项 →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16, shadowRadius: 40,
    elevation: 10,
  },
  savedText: {
    textAlign: 'center', paddingVertical: 10,
    fontSize: 16, fontWeight: '700', color: Colors.success,
  },
  locationStrip: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12, paddingHorizontal: 4,
  },
  locationDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.primary, marginRight: 8,
  },
  locationText: {
    fontSize: 12, color: Colors.textSecondary, fontWeight: '500', flex: 1,
  },
  moodRow: {
    flexDirection: 'row', gap: 4, marginBottom: 10,
  },
  moodCell: {
    flex: 1, aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
    gap: 2,
  },
  moodEmoji: { fontSize: 20 },
  moodLabelSel: {
    fontSize: 9, fontWeight: '700', letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: Colors.text,
  },
  micBtn: {},
  sendBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border, shadowOpacity: 0,
  },
  sendText: {
    fontSize: 22, color: '#FFFFFF', fontWeight: '600', marginTop: -2,
  },
  moreBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  moreText: {
    fontFamily: 'Menlo', fontSize: 10, color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
});
