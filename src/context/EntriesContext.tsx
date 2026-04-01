import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Entry, NewEntry } from '../types';
import * as entriesDb from '../database/entries';

interface EntriesContextType {
  entries: Entry[];
  loading: boolean;
  addEntry: (data: NewEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

const EntriesContext = createContext<EntriesContextType>({
  entries: [],
  loading: true,
  addEntry: async () => {},
  removeEntry: async () => {},
  refreshEntries: async () => {},
});

export const EntriesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化：从数据库加载所有记录
  const loadEntries = useCallback(async () => {
    try {
      const allEntries = await entriesDb.getAllEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // 添加新记录
  const addEntry = useCallback(async (data: NewEntry) => {
    const newEntry = await entriesDb.createEntry(data);
    setEntries((prev) => [newEntry, ...prev]);
  }, []);

  // 删除记录
  const removeEntry = useCallback(async (id: string) => {
    await entriesDb.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <EntriesContext.Provider
      value={{
        entries,
        loading,
        addEntry,
        removeEntry,
        refreshEntries: loadEntries,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
};

// Hook: 在任何组件中使用心情数据
export const useEntries = () => {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error('useEntries must be used within EntriesProvider');
  }
  return context;
};
