import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import dayjs from 'dayjs';

// 每日心情提示语 — 让用户更有动力记录
const PROMPTS_ZH = [
  '今天有什么值得记录的瞬间吗？',
  '此刻的你，在想什么呢？',
  '深呼吸，感受一下现在的心情',
  '今天遇到了什么有趣的事？',
  '给自己一点时间，记录此刻',
  '你今天做了什么让自己开心的事？',
  '每个瞬间都值得被珍藏',
  '停下来，感受一下周围的风景',
  '今天的你，和昨天有什么不同？',
  '写下来吧，未来的你会感谢现在的记录',
];

interface Props {
  hasRecordedToday: boolean;
}

export const DailyPrompt: React.FC<Props> = ({ hasRecordedToday }) => {
  if (hasRecordedToday) return null;

  // 根据日期选择一条提示语
  const dayOfYear = dayjs().month() * 31 + dayjs().date();
  const prompt = PROMPTS_ZH[dayOfYear % PROMPTS_ZH.length];

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💭</Text>
      <Text style={styles.text}>{prompt}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '08',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    lineHeight: 19,
  },
});
