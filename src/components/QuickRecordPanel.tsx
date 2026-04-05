import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
        mood: selectedMood,
        emoji: selectedEmoji,
        note: note.trim() || undefined,
        voiceUri: voiceUri || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        address,
      });

      setSaved(true);
      setSelectedMood(null);
      setSelectedEmoji('');
      setNote('');
      setVoiceUri(null);
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
        <View style={styles.savedRow}>
          <Text style={styles.savedText}>已记录 ✓</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 心情选择行 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMood === mood.type;
          return (
            <TouchableOpacity
              key={mood.type}
              style={[
                styles.moodButton,
                isSelected ? { backgroundColor: MoodColors[mood.type] + '20', borderColor: MoodColors[mood.type] } : undefined,
              ]}
              onPress={() => { setSelectedMood(mood.type); setSelectedEmoji(mood.emoji); }}
              activeOpacity={0.6}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 输入行：文字 + 语音 */}
      <View style={styles.inputRow}>
        {voiceUri ? (
          <View style={styles.voiceArea}>
            <VoiceMemoButton voiceUri={voiceUri} onRecorded={setVoiceUri} onClear={() => setVoiceUri(null)} />
          </View>
        ) : (
          <>
            <TextInput
              style={styles.textInput}
              placeholder="写点什么..."
              placeholderTextColor={Colors.textSecondary}
              value={note}
              onChangeText={setNote}
              maxLength={200}
            />
            <VoiceMemoButton voiceUri={null} onRecorded={setVoiceUri} onClear={() => {}} />
          </>
        )}
      </View>

      {/* 底部操作行 */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.moreButton} onPress={onFullEntry} activeOpacity={0.7}>
          <Text style={styles.moreText}>更多选项</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, canSave ? undefined : styles.sendButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave || saving}
          activeOpacity={0.7}
        >
          <Text style={[styles.sendText, canSave ? undefined : styles.sendTextDisabled]}>
            {saving ? '...' : '发送'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  savedRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  savedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  moodScroll: {
    marginBottom: 10,
  },
  moodButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
    marginRight: 8,
  },
  voiceArea: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moreButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  moreText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
  sendText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sendTextDisabled: {
    color: Colors.textSecondary,
  },
});
