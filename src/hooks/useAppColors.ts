import { useTheme } from '../context/ThemeContext';
import { LightColors, DarkColors, MoodColors } from '../constants/colors';

// 在组件中使用：const c = useAppColors();
export const useAppColors = () => {
  const { isDark } = useTheme();
  return isDark ? DarkColors : LightColors;
};

export { MoodColors };
