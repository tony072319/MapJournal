import { ActivityOption } from '../types';

// 预设活动标签 — 灵感来自 Daylio
export const ACTIVITY_OPTIONS: ActivityOption[] = [
  // 社交
  { id: 'friends', icon: '👥', label: '朋友' },
  { id: 'family', icon: '👨‍👩‍👧', label: '家人' },
  { id: 'date', icon: '💑', label: '约会' },
  // 活动
  { id: 'exercise', icon: '🏃', label: '运动' },
  { id: 'food', icon: '🍔', label: '美食' },
  { id: 'coffee', icon: '☕', label: '咖啡' },
  { id: 'shopping', icon: '🛍️', label: '购物' },
  { id: 'travel', icon: '✈️', label: '旅行' },
  // 状态
  { id: 'work', icon: '💼', label: '工作' },
  { id: 'study', icon: '📚', label: '学习' },
  { id: 'music', icon: '🎵', label: '音乐' },
  { id: 'movie', icon: '🎬', label: '电影' },
  { id: 'game', icon: '🎮', label: '游戏' },
  { id: 'sleep', icon: '😴', label: '睡觉' },
  { id: 'relax', icon: '🧘', label: '放松' },
  { id: 'pet', icon: '🐱', label: '宠物' },
];
