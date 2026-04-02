// 简易键值存储 - 优先使用 expo-file-system，回退到内存
let memoryStore: Record<string, string> = {};
let useFileSystem = false;
let fsModule: any = null;

try {
  fsModule = require('expo-file-system');
  // 检查新API是否可用
  if (fsModule.Paths && fsModule.File && fsModule.Directory) {
    useFileSystem = true;
  }
} catch {
  useFileSystem = false;
}

const getStorageDir = () => {
  if (!useFileSystem) return null;
  try {
    const dir = new fsModule.Directory(fsModule.Paths.document, 'kv-storage');
    if (!dir.exists) {
      dir.create();
    }
    return dir;
  } catch {
    useFileSystem = false;
    return null;
  }
};

const AsyncStorage = {
  getItem: (key: string): string | null => {
    if (useFileSystem) {
      try {
        const dir = getStorageDir();
        if (!dir) return memoryStore[key] || null;
        const file = new fsModule.File(dir, `${key}.txt`);
        if (!file.exists) return null;
        return file.textSync();
      } catch {
        return memoryStore[key] || null;
      }
    }
    return memoryStore[key] || null;
  },

  setItem: (key: string, value: string): void => {
    memoryStore[key] = value;
    if (useFileSystem) {
      try {
        const dir = getStorageDir();
        if (!dir) return;
        const file = new fsModule.File(dir, `${key}.txt`);
        file.write(value);
      } catch {}
    }
  },

  removeItem: (key: string): void => {
    delete memoryStore[key];
    if (useFileSystem) {
      try {
        const dir = getStorageDir();
        if (!dir) return;
        const file = new fsModule.File(dir, `${key}.txt`);
        if (file.exists) file.delete();
      } catch {}
    }
  },
};

export default AsyncStorage;
