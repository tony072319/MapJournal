import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { formatDateTime } from '../utils/dateFormat';
import { Entry, MoodType } from '../types';

interface Props {
  entry: Entry | null;
  onClose: () => void;
}

export const EntryDetail: React.FC<Props> = ({ entry, onClose }) => {
  if (!entry) return null;

  const mood = getMoodByType(entry.mood);
  const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;

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
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 心情emoji和标签 */}
          <View style={styles.moodSection}>
            <Text style={styles.emoji}>{entry.emoji}</Text>
            <Text style={[styles.moodLabel, { color: moodColor }]}>
              {mood.label}
            </Text>
          </View>

          {/* 照片 */}
          {entry.photoUri && (
            <Image source={{ uri: entry.photoUri }} style={styles.photo} />
          )}

          {/* 文字描述 */}
          {entry.note && (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>{entry.note}</Text>
            </View>
          )}

          {/* 时间和地点 */}
          <View style={styles.metaSection}>
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>🕐</Text>
              <Text style={styles.metaText}>
                {formatDateTime(entry.createdAt)}
              </Text>
            </View>
            {entry.address && (
              <View style={styles.metaRow}>
                <Text style={styles.metaIcon}>📍</Text>
                <Text style={styles.metaText}>{entry.address}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  moodSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 24,
  },
  noteCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  metaSection: {
    width: '100%',
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
