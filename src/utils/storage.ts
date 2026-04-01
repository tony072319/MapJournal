import { Paths, File, Directory } from 'expo-file-system';

// 简易的本地键值存储（基于文件系统）
const getStorageDir = (): Directory => {
  const dir = new Directory(Paths.document, 'kv-storage');
  if (!dir.exists) {
    dir.create();
  }
  return dir;
};

const AsyncStorage = {
  getItem: (key: string): string | null => {
    try {
      const file = new File(getStorageDir(), `${key}.txt`);
      if (!file.exists) return null;
      return file.textSync();
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      const file = new File(getStorageDir(), `${key}.txt`);
      file.write(value);
    } catch {
      // 静默失败
    }
  },

  removeItem: (key: string): void => {
    try {
      const file = new File(getStorageDir(), `${key}.txt`);
      if (file.exists) {
        file.delete();
      }
    } catch {
      // 静默失败
    }
  },
};

export default AsyncStorage;
