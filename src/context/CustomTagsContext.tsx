import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CustomTag } from '../types';
import * as customTagsDb from '../database/customTags';

interface CustomTagsContextType {
  customTags: CustomTag[];
  loading: boolean;
  addTag: (icon: string, label: string) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
}

const CustomTagsContext = createContext<CustomTagsContextType>({
  customTags: [],
  loading: true,
  addTag: async () => {},
  removeTag: async () => {},
});

export const CustomTagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customTags, setCustomTags] = useState<CustomTag[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTags = useCallback(async () => {
    try {
      const tags = await customTagsDb.getAllCustomTags();
      setCustomTags(tags);
    } catch (e) {
      console.error('加载自定义标签失败:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTags(); }, [loadTags]);

  const addTag = useCallback(async (icon: string, label: string) => {
    const tag = await customTagsDb.createCustomTag(icon, label);
    setCustomTags((prev) => [tag, ...prev]);
  }, []);

  const removeTag = useCallback(async (id: string) => {
    await customTagsDb.deleteCustomTag(id);
    setCustomTags((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <CustomTagsContext.Provider value={{ customTags, loading, addTag, removeTag }}>
      {children}
    </CustomTagsContext.Provider>
  );
};

export const useCustomTags = () => useContext(CustomTagsContext);
