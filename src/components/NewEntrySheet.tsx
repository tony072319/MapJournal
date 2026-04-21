import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MOOD_OPTIONS } from '../constants/moods';
import { ACTIVITY_OPTIONS } from '../constants/activities';
import { Colors, MoodColors } from '../constants/colors';
import { useEntries } from '../context/EntriesContext';
import { MoodType, UserLocation } from '../types';
import * as Location from 'expo-location';
import dayjs from 'dayjs';

interface Props {
  visible: boolean;
  onClose: () => void;
  location: UserLocation;
}

/**
 * NewEntrySheet — editorial full-sheet capture.
 * "I feel ___" as the hero. Serif note. Activities as chips.
 */
export const NewEntrySheet: React.FC<Props> = ({ visible, onClose, location }) => {
  const { addEntry } = useEntries();
  const [mood, setMood] = useState<MoodType | null>(null);
  const [emoji, setEmoji] = useState('');
  const [note, setNote] = useState('');
  const [activities, setActivities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const selected = MOOD_OPTIONS.find((m) => m.type === mood);

  const toggle = (id: string) =>
    setActivities((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const handleSave = async () => {
    if (!mood || saving) return;
    setSaving(true);
    try {
      let address: string | undefined;
      try {
        const r = await Location.reverseGeocodeAsync({
          latitude: location.latitude, longitude: location.longitude,
        });
        if (r.length > 0) {
          const p = r[0];
          address = [p.name, p.street, p.city].filter(Boolean).join(', ');
        }
      } catch {}
      await addEntry({
        mood, emoji,
        note: note.trim() || undefined,
        activities: activities.length ? activities : undefined,
        latitude: location.latitude, longitude: location.longitude,
        address,
      });
      setMood(null); setEmoji(''); setNote(''); setActivities([]);
      onClose();
    } finally { setSaving(false); }
  };

  const dateLabel = dayjs().format('ddd · M月D · H:mm').toUpperCase();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerKicker}>新的一刻 · NEW MOMENT</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, !mood && styles.saveBtnDisabled]}
            disabled={!mood || saving}
          >
            <Text style={[styles.saveTxt, !mood && styles.saveTxtDisabled]}>
              {saving ? '...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Place + date strip */}
          <View style={styles.strip}>
            <Text style={styles.stripDate}>{dateLabel}</Text>
            <View style={styles.placePill}>
              <View style={styles.placeDot} />
              <Text style={styles.placeText} numberOfLines={1}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          </View>

          {/* Sentence */}
          <View style={styles.sentenceWrap}>
            <Text style={styles.sentence}>
              我感觉{' '}
              {selected ? (
                <Text
                  style={[
                    styles.sentenceMood,
                    { color: MoodColors[selected.type], borderBottomColor: MoodColors[selected.type] },
                  ]}
                >
                  {selected.label} {selected.emoji}
                </Text>
              ) : (
                <Text style={styles.sentenceBlank}>___</Text>
              )}
            </Text>
          </View>

          {/* Mood slider */}
          <View style={styles.moodPanel}>
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((m) => {
                const sel = m.type === mood;
                return (
                  <TouchableOpacity
                    key={m.type}
                    style={[
                      styles.moodCell,
                      sel && { backgroundColor: MoodColors[m.type], transform: [{ scale: 1.06 }] },
                    ]}
                    onPress={() => { setMood(m.type); setEmoji(m.emoji); }}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.moodEmoji, { fontSize: sel ? 28 : 22 }]}>{m.emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.scaleRow}>
              <Text style={styles.scaleLabel}>BEST · 超棒</Text>
              <Text style={styles.scaleLabel}>WORST · 最差</Text>
            </View>
          </View>

          {/* Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>你在做什么 · WHAT ARE YOU DOING</Text>
            <View style={styles.chipsRow}>
              {ACTIVITY_OPTIONS.slice(0, 14).map((a) => {
                const sel = activities.includes(a.id);
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => toggle(a.id)}
                    style={[
                      styles.chip,
                      sel && { backgroundColor: Colors.text, borderColor: Colors.text },
                    ]}
                  >
                    <Text style={styles.chipIcon}>{a.icon}</Text>
                    <Text style={[styles.chipText, sel && { color: Colors.background }]}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>这一刻 · THIS MOMENT</Text>
            <View style={styles.noteBox}>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                multiline
                placeholder="写下你想记住的…"
                placeholderTextColor={Colors.muted}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  closeTxt: { fontSize: 22, color: Colors.text, marginTop: -3 },
  headerKicker: {
    fontFamily: 'Menlo', fontSize: 10, color: Colors.textSecondary,
    letterSpacing: 2,
  },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999,
    backgroundColor: Colors.text,
  },
  saveBtnDisabled: { backgroundColor: Colors.border },
  saveTxt: { color: Colors.background, fontWeight: '600', fontSize: 13 },
  saveTxtDisabled: { color: Colors.muted },

  strip: { paddingHorizontal: 20, paddingTop: 12 },
  stripDate: {
    fontFamily: 'Menlo', fontSize: 10.5, color: Colors.textSecondary,
    letterSpacing: 2.5, marginBottom: 6,
  },
  placePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  placeDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary, marginRight: 10,
  },
  placeText: {
    fontSize: 13, color: Colors.text, fontWeight: '500', flex: 1,
  },

  sentenceWrap: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 10 },
  sentence: {
    fontFamily: 'Georgia', fontSize: 32, color: Colors.text,
    letterSpacing: -0.6, lineHeight: 38,
  },
  sentenceMood: {
    fontStyle: 'italic', borderBottomWidth: 3,
  },
  sentenceBlank: {
    color: Colors.muted, fontStyle: 'italic',
  },

  moodPanel: {
    marginHorizontal: 20, marginTop: 14,
    backgroundColor: Colors.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  moodRow: { flexDirection: 'row', gap: 2 },
  moodCell: {
    flex: 1, aspectRatio: 1, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  moodEmoji: {},
  scaleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 8, paddingHorizontal: 4,
  },
  scaleLabel: {
    fontFamily: 'Menlo', fontSize: 9, color: Colors.muted, letterSpacing: 1.5,
  },

  section: { paddingHorizontal: 20, paddingTop: 22 },
  sectionLabel: {
    fontFamily: 'Menlo', fontSize: 10, color: Colors.textSecondary,
    letterSpacing: 2, marginBottom: 10,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipIcon: { fontSize: 14 },
  chipText: {
    fontSize: 12, color: Colors.textSecondary, fontWeight: '500',
  },
  noteBox: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.border, minHeight: 140,
  },
  noteInput: {
    fontFamily: 'Georgia', fontSize: 17, color: Colors.text,
    lineHeight: 24, minHeight: 110,
  },
});
