import { MoodOption } from '../types';
import { MoodColors } from './colors';

// 8 moods — best → worst. Emoji + glyph for editorial variations.
export const MOOD_OPTIONS: MoodOption[] = [
  { type: 'amazing', emoji: '🤩', label: '超棒',  color: MoodColors.amazing },
  { type: 'happy',   emoji: '😄', label: '开心',  color: MoodColors.happy   },
  { type: 'good',    emoji: '😊', label: '不错',  color: MoodColors.good    },
  { type: 'calm',    emoji: '😌', label: '平静',  color: MoodColors.calm    },
  { type: 'neutral', emoji: '😐', label: '一般',  color: MoodColors.neutral },
  { type: 'anxious', emoji: '😰', label: '焦虑',  color: MoodColors.anxious },
  { type: 'sad',     emoji: '😢', label: '难过',  color: MoodColors.sad     },
  { type: 'angry',   emoji: '😠', label: '生气',  color: MoodColors.angry   },
];

export const MOOD_LABELS_EN: Record<string, string> = {
  amazing: 'Amazing', happy: 'Happy', good: 'Good', calm: 'Calm',
  neutral: 'Neutral', anxious: 'Anxious', sad: 'Sad', angry: 'Angry',
};

export const getMoodByType = (type: string): MoodOption => {
  return MOOD_OPTIONS.find((m) => m.type === type) || MOOD_OPTIONS[4];
};
