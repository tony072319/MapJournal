import { getDatabase } from './db';
import { CustomTag } from '../types';
import { generateId } from '../utils/uuid';
import { nowISO } from '../utils/dateFormat';

export const getAllCustomTags = async (): Promise<CustomTag[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM custom_tags ORDER BY created_at DESC');
  return rows.map((row: any) => ({
    id: row.id,
    icon: row.icon,
    label: row.label,
    createdAt: row.created_at,
  }));
};

export const createCustomTag = async (icon: string, label: string): Promise<CustomTag> => {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  await db.runAsync(
    'INSERT INTO custom_tags (id, icon, label, created_at) VALUES (?, ?, ?, ?)',
    id, icon, label, now
  );
  return { id, icon, label, createdAt: now };
};

export const deleteCustomTag = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM custom_tags WHERE id = ?', id);
};
