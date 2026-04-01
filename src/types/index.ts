// 心情类型：5种基本心情
export type MoodType = 'happy' | 'good' | 'neutral' | 'sad' | 'angry';

// 一条心情记录的完整数据
export interface Entry {
  id: string;
  mood: MoodType;
  emoji: string;
  note: string | null;
  photoUri: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  createdAt: string; // ISO 格式
  updatedAt: string;
}

// 创建新记录时需要的数据（不含id和时间戳）
export interface NewEntry {
  mood: MoodType;
  emoji: string;
  note?: string;
  photoUri?: string;
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

// 地图样式类型
export type MapStyleType = 'standard' | 'satellite' | 'dark';

// 用户位置
export interface UserLocation {
  latitude: number;
  longitude: number;
}
