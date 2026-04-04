import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Entry, NewEntry } from '../types';
import * as entriesDb from '../database/entries';

interface EntriesContextType {
  entries: Entry[];
  loading: boolean;
  addEntry: (data: NewEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, data: Partial<NewEntry>) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

const EntriesContext = createContext<EntriesContextType>({
  entries: [],
  loading: true,
  addEntry: async () => {},
  removeEntry: async () => {},
  updateEntry: async () => {},
  refreshEntries: async () => {},
});

export const EntriesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

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

  const addEntry = useCallback(async (data: NewEntry) => {
    const newEntry = await entriesDb.createEntry(data);
    setEntries((prev) => [newEntry, ...prev]);
  }, []);

  const removeEntry = useCallback(async (id: string) => {
    await entriesDb.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateEntry = useCallback(async (id: string, data: Partial<NewEntry>) => {
    await entriesDb.updateEntry(id, data);
    // 重新加载以获取更新后的数据
    await loadEntries();
  }, [loadEntries]);

  return (
    <EntriesContext.Provider
      value={{
        entries,
        loading,
        addEntry,
        removeEntry,
        updateEntry,
        refreshEntries: loadEntries,
      }}
    >
      {children}
    </EntriesContext.Provider>
  );
};

export const useEntries = () => {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error('useEntries must be used within EntriesProvider');
  }
  return context;
};
