// 心情类型：8种心情
export type MoodType = 'amazing' | 'happy' | 'good' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'angry';

// 活动标签
export type ActivityTag = string;

// 一条心情记录的完整数据
export interface Entry {
  id: string;
  mood: MoodType;
  emoji: string;
  note: string | null;
  photoUri: string | null;
  activities: string | null; // JSON array of activity tags
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string; // ISO 格式
  updatedAt: string;
}

// 创建新记录时需要的数据
export interface NewEntry {
  mood: MoodType;
  emoji: string;
  note?: string;
  photoUri?: string;
  activities?: string[];
  latitude: number;
  longitude: number;
  address?: string;
}

// 心情的定义信息
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

// 用户位置
export interface UserLocation {
  latitude: number;
  longitude: number;
}
