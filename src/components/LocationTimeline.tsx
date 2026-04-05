import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { getMoodByType } from '../constants/moods';
import { ACTIVITY_OPTIONS } from '../constants/activities';
import { formatDateTime, formatRelative } from '../utils/dateFormat';
import { Entry, MoodType, TimelineFilterType } from '../types';

interface Props {
  entries: Entry[];
  locationName: string | null;
  visible: boolean;
  onClose: () => void;
  onEntryPress: (entry: Entry) => void;
}

export const LocationTimeline: React.FC<Props> = ({
  entries,
  locationName,
  visible,
  onClose,
  onEntryPress,
}) => {
  const [filter, setFilter] = useState<TimelineFilterType>('all');

  // 目前只有 'myself' 有数据，'friends' 是 coming soon
  const filteredEntries = useMemo(() => {
    if (filter === 'friends') return []; // 占位
    return entries; // 'all' 和 'myself' 目前一样
  }, [entries, filter]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.locationName} numberOfLines={1}>
              {locationName || '此位置'}
            </Text>
            <Text style={styles.entryCount}>{entries.length} 条记录</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>关闭</Text>
          </TouchableOpacity>
        </View>

        {/* 筛选条 */}
        <View style={styles.filterRow}>
          {(['all', 'myself', 'friends'] as TimelineFilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f ? styles.filterChipActive : undefined]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, filter === f ? styles.filterTextActive : undefined]}>
                {f === 'all' ? '全部' : f === 'myself' ? '我的' : '好友'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 条目列表 */}
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {filter === 'friends' && (
            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonIcon}>👥</Text>
              <Text style={styles.comingSoonText}>好友功能即将推出</Text>
            </View>
          )}

          {filteredEntries.map((entry) => {
            const mood = getMoodByType(entry.mood);
            const moodColor = MoodColors[entry.mood as MoodType] || Colors.primary;
            let activityLabels: string[] = [];
            if (entry.activities) {
              try {
                const ids = JSON.parse(entry.activities) as string[];
                activityLabels = ids.map((id) => {
                  const opt = ACTIVITY_OPTIONS.find((o) => o.id === id);
                  return opt ? `${opt.icon} ${opt.label}` : id;
                });
              } catch {}
            }

            return (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => onEntryPress(entry)}
                activeOpacity={0.7}
              >
                <View style={[styles.entryColorDot, { backgroundColor: moodColor }]} />
                <View style={styles.entryContent}>
                  <View style={styles.entryTopRow}>
                    <Text style={styles.entryEmoji}>{entry.emoji}</Text>
                    <Text style={[styles.entryMood, { color: moodColor }]}>{mood.label}</Text>
                    <Text style={styles.entryTime}>{formatRelative(entry.createdAt)}</Text>
                  </View>

                  {entry.note ? (
                    <Text style={styles.entryNote} numberOfLines={2}>{entry.note}</Text>
                  ) : null}

                  {activityLabels.length > 0 ? (
                    <Text style={styles.entryActivities} numberOfLines={1}>
                      {activityLabels.join(' · ')}
                    </Text>
                  ) : null}

                  {entry.photoUri ? (
                    <Image source={{ uri: entry.photoUri }} style={styles.entryPhoto} />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    maxWidth: 260,
  },
  entryCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  closeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary + '12',
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  entryCard: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  entryColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  entryContent: {
    flex: 1,
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  entryMood: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  entryTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  entryNote: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 4,
  },
  entryActivities: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  entryPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginTop: 4,
  },
});
