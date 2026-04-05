// 浅色主题 — 卡通极简风（柔和、温暖、圆润）
export const LightColors = {
  primary: '#7C6CF0',      // 柔和紫（比靛蓝更温暖）
  accent: '#FF8FAB',       // 柔粉
  background: '#FBF9F7',   // 暖白奶油色
  card: '#FFFFFF',
  text: '#2D2B3D',         // 深紫灰（比纯黑更柔和）
  textSecondary: '#8E8CA3', // 紫灰
  border: '#EEEDF5',       // 淡紫边框
  shadow: '#7C6CF0',       // 用主色做阴影更柔和
  success: '#5CD07A',      // 柔绿
};

// 深色主题 — 同样柔和
export const DarkColors = {
  primary: '#9B8FFF',
  accent: '#FFB3C6',
  background: '#1A1928',    // 深紫夜色
  card: '#252338',
  text: '#F0EEF6',
  textSecondary: '#9896B0',
  border: '#3A3850',
  shadow: '#000000',
  success: '#7AE89B',
};

// 默认导出浅色
export const Colors = LightColors;

// 心情颜色 — 更柔和的色调
export const MoodColors: Record<string, string> = {
  amazing: '#FF7EB3',  // 柔粉红
  happy: '#FFB347',    // 暖橙黄
  good: '#77DD77',     // 薄荷绿
  calm: '#89CFF0',     // 天空蓝
  neutral: '#B0AEC1',  // 薰衣草灰
  anxious: '#FFB84D',  // 琥珀
  sad: '#B19CD9',      // 淡紫
  angry: '#FF6B6B',    // 柔红
};
