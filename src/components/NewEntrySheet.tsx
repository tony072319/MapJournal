import React, { useState } from 'react';
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
} from 'react-native';
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
      });

      // 重置表单并关闭
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
          <Text style={styles.headerTitle}>记录心情</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={!mood || saving}
            style={[styles.saveButton, (!mood || saving) && styles.saveButtonDisabled]}
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
        >
          {/* 心情选择 */}
          <MoodPicker selected={mood} onSelect={handleMoodSelect} />

          {/* 照片 */}
          <PhotoPicker photoUri={photoUri} onPhotoPicked={setPhotoUri} />

          {/* 文字描述 */}
          <View style={styles.noteSection}>
            <Text style={styles.noteTitle}>写点什么（可选）</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="此刻的想法..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
              maxLength={500}
            />
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
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  },
});
