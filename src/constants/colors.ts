// 主题颜色
export const Colors = {
  primary: '#6C63FF',      // 柔和紫色
  accent: '#FF6584',       // 珊瑚粉
  background: '#F8F9FE',   // 极浅灰蓝
  card: '#FFFFFF',         // 卡片白
  text: '#2D3436',         // 深灰文字
  textSecondary: '#95A5A6', // 辅助灰文字
  border: '#E8ECF4',       // 边框色
  shadow: '#000000',       // 阴影色（配合opacity使用）
};

// 心情对应颜色 — 8种
export const MoodColors: Record<string, string> = {
  amazing: '#FF6B9D',  // 粉红 — 超棒
  happy: '#FFD93D',    // 明亮黄 — 开心
  good: '#6BCB77',     // 清新绿 — 不错
  calm: '#74C0FC',     // 天蓝 — 平静
  neutral: '#A0AEC0',  // 灰蓝 — 一般
  anxious: '#F7B731',  // 琥珀 — 焦虑
  sad: '#9B59B6',      // 忧郁紫 — 难过
  angry: '#FF6B6B',    // 警示红 — 生气
};
