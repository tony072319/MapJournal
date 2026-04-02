import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { formatDateTime } from '../utils/dateFormat';
import { useEntries } from '../context/EntriesContext';
import { Entry, MoodType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  entry: Entry | null;
  onClose: () => void;
}

export const EntryDetail: React.FC<Props> = ({ entry, onClose }) => {
  const { removeEntry } = useEntries();
  const [photoFullscreen, setPhotoFullscreen] = useState(false);

  if (!entry) return null;

  const mood = getMoodByType(entry.mood);
  const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;

  const handleDelete = () => {
    Alert.alert(
      '删除这条记录？',
      '删除后无法恢复',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            await removeEntry(entry.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 顶部色条 */}
        <View style={[styles.topBar, { backgroundColor: moodColor }]} />

        {/* 头部操作栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>删除</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>完成</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 心情大展示 */}
          <View style={styles.moodSection}>
            <View style={[styles.moodCircle, { backgroundColor: moodColor + '12' }]}>
              <Text style={styles.emoji}>{entry.emoji}</Text>
            </View>
            <Text style={[styles.moodLabel, { color: moodColor }]}>
              {mood.label}
            </Text>
            <Text style={styles.dateTime}>{formatDateTime(entry.createdAt)}</Text>
          </View>

          {/* 照片 */}
          {entry.photoUri ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPhotoFullscreen(true)}
              style={styles.photoContainer}
            >
              <Image source={{ uri: entry.photoUri }} style={styles.photo} />
            </TouchableOpacity>
          ) : null}

          {/* 文字描述 */}
          {entry.note ? (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>{entry.note}</Text>
            </View>
          ) : null}

          {/* 位置信息 */}
          <View style={styles.metaCard}>
            <MetaRow
              label="位置"
              value={entry.address || `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`}
            />
          </View>
        </ScrollView>
      </View>

      {/* 照片全屏预览 */}
      {entry.photoUri ? (
        <Modal
          visible={photoFullscreen}
          animationType="fade"
          onRequestClose={() => setPhotoFullscreen(false)}
        >
          <TouchableOpacity
            style={styles.fullscreenContainer}
            activeOpacity={1}
            onPress={() => setPhotoFullscreen(false)}
          >
            <Image
              source={{ uri: entry.photoUri }}
              style={styles.fullscreenPhoto}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.fullscreenClose}
              onPress={() => setPhotoFullscreen(false)}
            >
              <Text style={styles.fullscreenCloseText}>关闭</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      ) : null}
    </Modal>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue} numberOfLines={2}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  topBar: {
    height: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  deleteText: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // 心情展示
  moodSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  moodCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 44,
  },
  moodLabel: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dateTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  // 照片
  photoContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  photo: {
    width: '100%',
    height: 240,
  },
  // 文字
  noteCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
  },
  // 元信息
  metaCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    width: 40,
    fontWeight: '500',
  },
  metaValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  // 全屏照片
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenPhoto: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  fullscreenClose: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fullscreenCloseText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
