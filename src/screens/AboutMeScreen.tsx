import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useEntries } from '../context/EntriesContext';
import { Colors, MoodColors } from '../constants/colors';
import { MOOD_OPTIONS } from '../constants/moods';
import { MoodType } from '../types';
import dayjs from 'dayjs';

// 组件
import { UserProfileCard } from '../components/UserProfileCard';
import { SettingsSection } from '../components/SettingsSection';
import { MoodCalendar } from '../components/MoodCalendar';
import { MoodChart } from '../components/MoodChart';
import { MoodInsight } from '../components/MoodInsight';
import { YearPixels } from '../components/YearPixels';
import { TopLocations } from '../components/TopLocations';
import { Achievements } from '../components/Achievements';

export const AboutMeScreen: React.FC = () => {
  const { entries } = useEntries();

  // 连续记录天数
  const streakDays = useMemo(() => {
    if (entries.length === 0) return 0;
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
    return streak;
  }, [entries]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 用户资料卡片 */}
      <UserProfileCard
        entryCount={entries.length}
        friendCount={0}
        streakDays={streakDays}
      />

      {/* 设置 */}
      <SettingsSection entries={entries} />

      {/* 回忆 — 数据分析 */}
      {entries.length > 0 && (
        <>
          {/* 心情日历 */}
          <MoodCalendar entries={entries} onDayPress={() => {}} />

          {/* 7天趋势 */}
          <MoodChart entries={entries} />

          {/* 心情洞察 */}
          <MoodInsight entries={entries} />

          {/* 最常去的地点 */}
          <TopLocations entries={entries} />

          {/* 年度像素图 */}
          <YearPixels entries={entries} />

          {/* 成就徽章 */}
          <Achievements entries={entries} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
});
