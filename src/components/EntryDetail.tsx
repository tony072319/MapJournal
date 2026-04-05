import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType, MOOD_OPTIONS } from '../constants/moods';
import { ACTIVITY_OPTIONS } from '../constants/activities';
import { formatDateTime } from '../utils/dateFormat';
import { useEntries } from '../context/EntriesContext';
import { Entry, MoodType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  entry: Entry | null;
  onClose: () => void;
}

export const EntryDetail: React.FC<Props> = ({ entry, onClose }) => {
  const { removeEntry, updateEntry } = useEntries();
  const [photoFullscreen, setPhotoFullscreen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editMood, setEditMood] = useState<MoodType | null>(null);

  if (!entry) return null;

  const mood = getMoodByType(editing && editMood ? editMood : entry.mood);
  const moodColor = MoodColors[(editing && editMood ? editMood : entry.mood) as MoodType] || Colors.primary;

  const handleDelete = () => {
    Alert.alert('删除这条记录？', '删除后无法恢复', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除', style: 'destructive',
        onPress: async () => { await removeEntry(entry.id); onClose(); },
      },
    ]);
  };

  const startEdit = () => {
    setEditNote(entry.note || '');
    setEditMood(entry.mood as MoodType);
    setEditing(true);
  };

  const saveEdit = async () => {
    await updateEntry(entry.id, {
      mood: editMood || entry.mood as MoodType,
      emoji: getMoodByType(editMood || entry.mood).emoji,
      note: editNote.trim() || undefined,
    });
    setEditing(false);
    onClose();
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  // 解析活动标签
  let activityLabels: { icon: string; label: string }[] = [];
  if (entry.activities) {
    try {
      const ids = JSON.parse(entry.activities) as string[];
      activityLabels = ids.map((id) => {
        const opt = ACTIVITY_OPTIONS.find((o) => o.id === id);
        return { icon: opt?.icon || '📌', label: opt?.label || id };
      });
    } catch {}
  }

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.topBar, { backgroundColor: moodColor }]} />

        <View style={styles.header}>
          {editing ? (
            <>
              <TouchableOpacity onPress={cancelEdit}>
                <Text style={styles.cancelEditText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} style={styles.saveEditButton}>
                <Text style={styles.saveEditText}>保存</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={handleDelete}>
                <Text style={styles.deleteText}>删除</Text>
              </TouchableOpacity>
              <View style={styles.headerRight}>
                <TouchableOpacity onPress={startEdit} style={styles.editButton}>
                  <Text style={styles.editText}>编辑</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>完成</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 心情 */}
          <View style={styles.moodSection}>
            {editing ? (
              <View style={styles.editMoodRow}>
                {MOOD_OPTIONS.map((m) => (
                  <TouchableOpacity
                    key={m.type}
                    style={[
                      styles.editMoodOption,
                      editMood === m.type ? { backgroundColor: m.color + '20', borderColor: m.color } : undefined,
                    ]}
                    onPress={() => setEditMood(m.type)}
                  >
                    <Text style={styles.editMoodEmoji}>{m.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <>
                <View style={[styles.moodCircle, { backgroundColor: moodColor + '12' }]}>
                  <Text style={styles.emoji}>{entry.emoji}</Text>
                </View>
                <Text style={[styles.moodLabel, { color: moodColor }]}>{mood.label}</Text>
              </>
            )}
            <Text style={styles.dateTime}>{formatDateTime(entry.createdAt)}</Text>
          </View>

          {/* 照片 */}
          {entry.photoUri ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => setPhotoFullscreen(true)} style={styles.photoContainer}>
              <Image source={{ uri: entry.photoUri }} style={styles.photo} />
            </TouchableOpacity>
          ) : null}

          {/* 活动标签 */}
          {activityLabels.length > 0 ? (
            <View style={styles.activitiesRow}>
              {activityLabels.map((a, i) => (
                <View key={i} style={styles.activityChip}>
                  <Text style={styles.activityChipText}>{a.icon} {a.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* 文字 */}
          {editing ? (
            <TextInput
              style={styles.editNoteInput}
              value={editNote}
              onChangeText={setEditNote}
              multiline
              placeholder="写点什么..."
              placeholderTextColor={Colors.textSecondary}
              textAlignVertical="top"
              maxLength={500}
            />
          ) : entry.note ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>{entry.note}</Text>
            </View>
          ) : null}

          {/* 位置 */}
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>位置</Text>
            <Text style={styles.metaValue}>
              {entry.address || `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`}
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* 照片全屏 */}
      {entry.photoUri ? (
        <Modal visible={photoFullscreen} animationType="fade" onRequestClose={() => setPhotoFullscreen(false)}>
          <TouchableOpacity style={styles.fullscreenContainer} activeOpacity={1} onPress={() => setPhotoFullscreen(false)}>
            <Image source={{ uri: entry.photoUri }} style={styles.fullscreenPhoto} resizeMode="contain" />
            <TouchableOpacity style={styles.fullscreenClose} onPress={() => setPhotoFullscreen(false)}>
              <Text style={styles.fullscreenCloseText}>关闭</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      ) : null}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card },
  topBar: { height: 4 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteText: { fontSize: 15, color: '#EF4444', fontWeight: '500' },
  editButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginRight: 8,
  },
  editText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  closeText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  cancelEditText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' },
  saveEditButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  saveEditText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  moodSection: { alignItems: 'center', paddingVertical: 20, marginBottom: 20 },
  moodCircle: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  emoji: { fontSize: 44 },
  moodLabel: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  dateTime: { fontSize: 14, color: Colors.textSecondary, marginTop: 6 },
  editMoodRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 },
  editMoodOption: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    margin: 4, borderWidth: 2, borderColor: 'transparent',
  },
  editMoodEmoji: { fontSize: 22 },
  photoContainer: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 16,
    shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  photo: { width: '100%', height: 240 },
  activitiesRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  activityChip: {
    backgroundColor: Colors.primary + '10', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6,
  },
  activityChipText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  noteCard: {
    backgroundColor: Colors.background, borderRadius: 16, padding: 18, marginBottom: 16,
  },
  noteText: { fontSize: 16, color: Colors.text, lineHeight: 26 },
  editNoteInput: {
    backgroundColor: Colors.background, borderRadius: 14, padding: 16,
    fontSize: 15, color: Colors.text, minHeight: 100, lineHeight: 22,
    marginBottom: 16, borderWidth: 2, borderColor: Colors.primary + '30',
  },
  metaCard: {
    backgroundColor: Colors.background, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  metaLabel: { fontSize: 13, color: Colors.textSecondary, width: 40, fontWeight: '500' },
  metaValue: { flex: 1, fontSize: 14, color: Colors.text },
  fullscreenContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  fullscreenPhoto: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  fullscreenClose: {
    position: 'absolute', top: 60, right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  fullscreenCloseText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
