import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../constants/colors';
import { MoodPicker } from './MoodPicker';
import { PhotoPicker } from './PhotoPicker';
import { ActivityPicker } from './ActivityPicker';
import { useEntries } from '../context/EntriesContext';
import { MoodType, UserLocation } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  location: UserLocation;
}

export const NewEntrySheet: React.FC<Props> = ({ visible, onClose, location }) => {
  const { addEntry } = useEntries();
  const [mood, setMood] = useState<MoodType | null>(null);
  const [emoji, setEmoji] = useState<string>('');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (visible && location) {
      reverseGeocode();
    }
  }, [visible, location]);

  const reverseGeocode = async () => {
    setGeocoding(true);
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      if (results.length > 0) {
        const r = results[0];
        const parts = [r.name, r.street, r.district, r.city].filter(Boolean);
        setAddress(parts.length > 0 ? parts.join(', ') : null);
      }
    } catch {
      setAddress(null);
    } finally {
      setGeocoding(false);
    }
  };

  const handleMoodSelect = (selectedMood: MoodType, selectedEmoji: string) => {
    setMood(selectedMood);
    setEmoji(selectedEmoji);
  };

  const handleSave = async () => {
    if (!mood) return;
    setSaving(true);
    try {
      await addEntry({
        mood, emoji,
        note: note.trim() || undefined,
        photoUri: photoUri || undefined,
        activities: activities.length > 0 ? activities : undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        address: address || undefined,
      });
      resetForm();
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setMood(null);
    setEmoji('');
    setNote('');
    setPhotoUri(null);
    setActivities([]);
    setAddress(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!mood || saving}
            style={[styles.saveButton, (!mood || saving) ? styles.saveButtonDisabled : undefined]}
          >
            <Text
              style={[styles.saveText, (!mood || saving) ? styles.saveTextDisabled : undefined]}
            >
              {saving ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 位置信息 */}
          <View style={styles.locationBar}>
            <View style={styles.locationDot} />
            {geocoding ? (
              <ActivityIndicator size="small" color={Colors.textSecondary} />
            ) : (
              <Text style={styles.locationText} numberOfLines={1}>
                {address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
              </Text>
            )}
          </View>

          {/* 问题式流程 */}
          <MoodPicker selected={mood} onSelect={handleMoodSelect} />

          {/* 活动标签 — Daylio 风格 */}
          <ActivityPicker
            selected={activities}
            onToggle={(id) =>
              setActivities((prev) =>
                prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
              )
            }
          />

          <PhotoPicker photoUri={photoUri} onPhotoPicked={setPhotoUri} />

          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>这一刻发生了什么？</Text>
            <TextInput
              style={[styles.noteInput, note.length > 0 ? styles.noteInputActive : undefined]}
              placeholder="写下你的想法..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
              maxLength={500}
            />
            <Text style={styles.charCount}>{note.length}/500</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.border,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveTextDisabled: {
    color: Colors.textSecondary,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: 10,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  noteSection: {
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    lineHeight: 22,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  noteInputActive: {
    borderColor: Colors.primary + '30',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});
