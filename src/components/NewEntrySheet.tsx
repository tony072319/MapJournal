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
  const [saving, setSaving] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // 打开时自动反向地理编码获取地址
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
        const addr = parts.length > 0 ? parts.join(', ') : null;
        setAddress(addr);
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
        mood,
        emoji,
        note: note.trim() || undefined,
        photoUri: photoUri || undefined,
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
    setAddress(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 已完成的步骤数（用于进度指示）
  const stepsCompleted = [mood !== null, photoUri !== null, note.trim().length > 0].filter(Boolean).length;

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
          <TouchableOpacity onPress={handleClose} accessibilityLabel="取消" accessibilityRole="button">
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>记录心情</Text>
            {/* 进度指示点 */}
            <View style={styles.progressDots}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[styles.dot, i < stepsCompleted && styles.dotCompleted]}
                />
              ))}
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!mood || saving}
            style={[styles.saveButton, (!mood || saving) && styles.saveButtonDisabled]}
            accessibilityLabel="保存心情记录"
            accessibilityRole="button"
          >
            <Text
              style={[styles.saveText, (!mood || saving) && styles.saveTextDisabled]}
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
            <Text style={styles.locationIcon}>📍</Text>
            {geocoding ? (
              <ActivityIndicator size="small" color={Colors.textSecondary} />
            ) : (
              <Text style={styles.locationText} numberOfLines={1}>
                {address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
              </Text>
            )}
          </View>

          {/* 心情选择 */}
          <MoodPicker selected={mood} onSelect={handleMoodSelect} />

          {/* 照片 */}
          <PhotoPicker photoUri={photoUri} onPhotoPicked={setPhotoUri} />

          {/* 文字描述 */}
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>写点什么（可选）</Text>
            <TextInput
              style={[styles.noteInput, note.length > 0 && styles.noteInputActive]}
              placeholder="此刻的想法..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
              maxLength={500}
              accessibilityLabel="心情文字描述"
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.textSecondary,
    width: 56,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  dotCompleted: {
    backgroundColor: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 56,
    alignItems: 'center',
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    gap: 8,
  },
  locationIcon: {
    fontSize: 14,
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
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
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
