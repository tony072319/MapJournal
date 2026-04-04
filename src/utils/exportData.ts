import { Entry } from '../types';
import { getMoodByType } from '../constants/moods';
import { ACTIVITY_OPTIONS } from '../constants/activities';
import { formatDateTime } from './dateFormat';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';

// 将心情数据导出为 CSV 文件
export const exportEntriesAsCSV = async (entries: Entry[]): Promise<boolean> => {
  try {
    const headers = '日期,心情,心情标签,活动,文字,地址,纬度,经度';
    const rows = entries.map((e) => {
      const mood = getMoodByType(e.mood);
      let activities = '';
      if (e.activities) {
        try {
          const ids = JSON.parse(e.activities) as string[];
          activities = ids
            .map((id) => ACTIVITY_OPTIONS.find((o) => o.id === id)?.label || id)
            .join(';');
        } catch {}
      }
      // CSV 需要转义引号
      const note = (e.note || '').replace(/"/g, '""');
      const address = (e.address || '').replace(/"/g, '""');
      return `${formatDateTime(e.createdAt)},${e.emoji},${mood.label},"${activities}","${note}","${address}",${e.latitude},${e.longitude}`;
    });

    const csv = [headers, ...rows].join('\n');

    const file = new File(Paths.cache, 'mapjournal_export.csv');
    file.write(csv);

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        dialogTitle: '导出心情数据',
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
};
