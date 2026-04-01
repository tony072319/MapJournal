import { MoodOption } from '../types';
import { MoodColors } from './colors';

// 5种心情选项
export const MOOD_OPTIONS: MoodOption[] = [
  { type: 'happy', emoji: '😄', label: '开心', color: MoodColors.happy },
  { type: 'good', emoji: '😊', label: '不错', color: MoodColors.good },
  { type: 'neutral', emoji: '😐', label: '一般', color: MoodColors.neutral },
  { type: 'sad', emoji: '😢', label: '难过', color: MoodColors.sad },
  { type: 'angry', emoji: '😠', label: '生气', color: MoodColors.angry },
];

// 通过心情类型快速查找
export const getMoodByType = (type: string): MoodOption => {
  return MOOD_OPTIONS.find((m) => m.type === type) || MOOD_OPTIONS[2];
};
