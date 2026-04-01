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
import { formatDateTime, formatRelative } from '../utils/dateFormat';
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
      '删除后无法恢复，确定要继续吗？',
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
      visible={!!entry}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>删除</Text>
          </TouchableOpacity>
          <Text style={styles.headerTime}>{formatRelative(entry.createdAt)}</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 心情顶部色条 */}
          <View style={[styles.moodBanner, { backgroundColor: moodColor + '15' }]}>
            <Text style={styles.emoji}>{entry.emoji}</Text>
            <Text style={[styles.moodLabel, { color: moodColor }]}>
              {mood.label}
            </Text>
          </View>

          {/* 照片 */}
          {entry.photoUri && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPhotoFullscreen(true)}
            >
              <Image source={{ uri: entry.photoUri }} style={styles.photo} />
              <Text style={styles.photoHint}>点击查看大图</Text>
            </TouchableOpacity>
          )}

          {/* 文字描述 */}
          {entry.note && (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>{entry.note}</Text>
            </View>
          )}

          {/* 时间和地点 */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>🕐</Text>
              <View>
                <Text style={styles.metaLabel}>时间</Text>
                <Text style={styles.metaText}>
                  {formatDateTime(entry.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📍</Text>
              <View>
                <Text style={styles.metaLabel}>位置</Text>
                <Text style={styles.metaText}>
                  {entry.address || `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* 照片全屏预览 */}
      {entry.photoUri && (
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
            <Text style={styles.fullscreenHint}>点击任意处关闭</Text>
          </TouchableOpacity>
        </Modal>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deleteButton: {
    width: 50,
  },
  deleteText: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '500',
  },
  headerTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  closeText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'right',
    width: 50,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  moodBanner: {
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 22,
    fontWeight: '700',
  },
  photo: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 4,
  },
  photoHint: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  noteCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 26,
  },
  metaCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  metaDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  metaIcon: {
    fontSize: 20,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 15,
    color: Colors.text,
  },
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
  fullscreenHint: {
    position: 'absolute',
    bottom: 60,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
});
