// 浅色主题
export const LightColors = {
  primary: '#6366F1',
  accent: '#F472B6',
  background: '#FAFAF9',
  card: '#FFFFFF',
  text: '#1C1917',
  textSecondary: '#78716C',
  border: '#E7E5E4',
  shadow: '#000000',
  success: '#22C55E',
};

// 深色主题
export const DarkColors = {
  primary: '#818CF8',
  accent: '#F9A8D4',
  background: '#1C1917',
  card: '#292524',
  text: '#FAFAF9',
  textSecondary: '#A8A29E',
  border: '#44403C',
  shadow: '#000000',
  success: '#4ADE80',
};

// 默认导出浅色（组件通过 useAppColors() 获取动态颜色）
export const Colors = LightColors;

// 心情颜色 — 深浅模式通用
export const MoodColors: Record<string, string> = {
  amazing: '#EC4899',
  happy: '#F59E0B',
  good: '#10B981',
  calm: '#06B6D4',
  neutral: '#94A3B8',
  anxious: '#F97316',
  sad: '#8B5CF6',
  angry: '#EF4444',
};
