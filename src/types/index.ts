// 心情类型：8种心情
export type MoodType = 'amazing' | 'happy' | 'good' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'angry';

// 活动标签
export type ActivityTag = string;

// 位置时间轴筛选类型
export type TimelineFilterType = 'all' | 'myself' | 'friends';

// 一条心情记录
export interface Entry {
  id: string;
  mood: MoodType;
  emoji: string;
  note: string | null;
  photoUri: string | null;
  voiceUri: string | null;
  activities: string | null; // JSON array
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

// 创建新记录
export interface NewEntry {
  mood: MoodType;
  emoji: string;
  note?: string;
  photoUri?: string;
  voiceUri?: string;
  activities?: string[];
  latitude: number;
  longitude: number;
  address?: string;
}

// 心情选项
export interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
}

// 预设活动选项
export interface ActivityOption {
  id: string;
  icon: string;
  label: string;
}

// 用户资料
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUri: string | null;
  language: string;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

// 自定义标签
export interface CustomTag {
  id: string;
  icon: string;
  label: string;
  createdAt: string;
}

// 好友（占位）
export interface Friend {
  id: string;
  displayName: string;
  avatarUri: string | null;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
}

// 用户位置
export interface UserLocation {
  latitude: number;
  longitude: number;
}
