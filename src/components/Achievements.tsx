import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, MoodColors } from '../constants/colors';
import { Entry } from '../types';
import dayjs from 'dayjs';

interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress?: string; // e.g. "3/5"
}

interface Props {
  entries: Entry[];
}

export const Achievements: React.FC<Props> = ({ entries }) => {
  const badges = useMemo((): Badge[] => {
    const totalEntries = entries.length;
    const uniqueDays = new Set(entries.map((e) => dayjs(e.createdAt).format('YYYY-MM-DD'))).size;
    const photosCount = entries.filter((e) => e.photoUri).length;
    const activitiesUsed = new Set(
      entries.flatMap((e) => {
        if (!e.activities) return [];
        try { return JSON.parse(e.activities) as string[]; } catch { return []; }
      })
    ).size;
    const moodsUsed = new Set(entries.map((e) => e.mood)).size;

    // 计算连续天数
    const dates = [...new Set(entries.map((e) => dayjs(e.createdAt).format('YYYY-MM-DD')))]
      .sort().reverse();
    let streak = 0;
    let current = dayjs();
    for (const dateStr of dates) {
      if (current.diff(dayjs(dateStr), 'day') <= 1) {
        streak++;
        current = dayjs(dateStr);
      } else break;
    }

    return [
      {
        id: 'first',
        icon: '🌱',
        title: '新的开始',
        description: '记录第一条心情',
        unlocked: totalEntries >= 1,
      },
      {
        id: 'five',
        icon: '⭐',
        title: '初露锋芒',
        description: '记录5条心情',
        unlocked: totalEntries >= 5,
        progress: totalEntries < 5 ? `${totalEntries}/5` : undefined,
      },
      {
        id: 'twenty',
        icon: '🏆',
        title: '坚持不懈',
        description: '记录20条心情',
        unlocked: totalEntries >= 20,
        progress: totalEntries < 20 ? `${totalEntries}/20` : undefined,
      },
      {
        id: 'hundred',
        icon: '💎',
        title: '心情收藏家',
        description: '记录100条心情',
        unlocked: totalEntries >= 100,
        progress: totalEntries < 100 ? `${totalEntries}/100` : undefined,
      },
      {
        id: 'streak3',
        icon: '🔥',
        title: '三日坚持',
        description: '连续3天记录',
        unlocked: streak >= 3,
        progress: streak < 3 ? `${streak}/3` : undefined,
      },
      {
        id: 'streak7',
        icon: '🔥',
        title: '一周连续',
        description: '连续7天记录',
        unlocked: streak >= 7,
        progress: streak < 7 ? `${streak}/7` : undefined,
      },
      {
        id: 'streak30',
        icon: '👑',
        title: '月度王者',
        description: '连续30天记录',
        unlocked: streak >= 30,
        progress: streak < 30 ? `${streak}/30` : undefined,
      },
      {
        id: 'photographer',
        icon: '📸',
        title: '摄影师',
        description: '上传10张照片',
        unlocked: photosCount >= 10,
        progress: photosCount < 10 ? `${photosCount}/10` : undefined,
      },
      {
        id: 'explorer',
        icon: '🗺️',
        title: '探索者',
        description: '在10个不同的日子记录',
        unlocked: uniqueDays >= 10,
        progress: uniqueDays < 10 ? `${uniqueDays}/10` : undefined,
      },
      {
        id: 'diverse',
        icon: '🎭',
        title: '情感丰富',
        description: '使用过所有8种心情',
        unlocked: moodsUsed >= 8,
        progress: moodsUsed < 8 ? `${moodsUsed}/8` : undefined,
      },
      {
        id: 'active',
        icon: '🎯',
        title: '生活达人',
        description: '使用过8种不同活动标签',
        unlocked: activitiesUsed >= 8,
        progress: activitiesUsed < 8 ? `${activitiesUsed}/8` : undefined,
      },
    ];
  }, [entries]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>成就徽章</Text>
        <Text style={styles.count}>{unlockedCount}/{badges.length}</Text>
      </View>

      <View style={styles.grid}>
        {badges.map((badge) => (
          <View
            key={badge.id}
            style={[
              styles.badge,
              badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked,
            ]}
          >
            <Text style={[styles.badgeIcon, badge.unlocked ? undefined : styles.badgeIconLocked]}>
              {badge.icon}
            </Text>
            <Text style={[styles.badgeTitle, badge.unlocked ? undefined : styles.badgeTitleLocked]} numberOfLines={1}>
              {badge.title}
            </Text>
            {badge.progress ? (
              <Text style={styles.badgeProgress}>{badge.progress}</Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    width: '33.33%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  badgeUnlocked: {},
  badgeLocked: {
    opacity: 0.35,
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  badgeIconLocked: {
    opacity: 0.5,
  },
  badgeTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  badgeTitleLocked: {
    color: Colors.textSecondary,
  },
  badgeProgress: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
});
