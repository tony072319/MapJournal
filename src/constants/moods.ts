import { MoodOption } from '../types';
import { MoodColors } from './colors';

// 8种心情选项 — 从最好到最差排列
export const MOOD_OPTIONS: MoodOption[] = [
  { type: 'amazing', emoji: '🤩', label: '超棒', color: MoodColors.amazing },
  { type: 'happy', emoji: '😄', label: '开心', color: MoodColors.happy },
  { type: 'good', emoji: '😊', label: '不错', color: MoodColors.good },
  { type: 'calm', emoji: '😌', label: '平静', color: MoodColors.calm },
  { type: 'neutral', emoji: '😐', label: '一般', color: MoodColors.neutral },
  { type: 'anxious', emoji: '😰', label: '焦虑', color: MoodColors.anxious },
  { type: 'sad', emoji: '😢', label: '难过', color: MoodColors.sad },
  { type: 'angry', emoji: '😠', label: '生气', color: MoodColors.angry },
];

// 通过心情类型快速查找
export const getMoodByType = (type: string): MoodOption => {
  return MOOD_OPTIONS.find((m) => m.type === type) || MOOD_OPTIONS[4]; // 默认返回"一般"
};
