import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 格式化为完整日期时间：2024年3月15日 14:30
export const formatDateTime = (date: string): string => {
  return dayjs(date).format('YYYY年M月D日 HH:mm');
};

// 格式化为短日期：3月15日
export const formatShortDate = (date: string): string => {
  return dayjs(date).format('M月D日');
};

// 相对时间：3分钟前、2小时前
export const formatRelative = (date: string): string => {
  return dayjs(date).fromNow();
};

// 获取当前ISO时间字符串
export const nowISO = (): string => {
  return dayjs().toISOString();
};
