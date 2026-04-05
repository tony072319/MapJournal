import { getDatabase } from './db';
import { UserProfile } from '../types';
import { nowISO } from '../utils/dateFormat';

const rowToProfile = (row: any): UserProfile => ({
  id: row.id,
  displayName: row.display_name,
  avatarUri: row.avatar_uri,
  language: row.language,
  darkMode: row.dark_mode === 1,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getProfile = async (): Promise<UserProfile> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM user_profile WHERE id = ?', 'local_user');
  if (rows.length > 0) return rowToProfile(rows[0]);

  // 初始化默认资料
  const now = nowISO();
  await db.runAsync(
    `INSERT INTO user_profile (id, display_name, avatar_uri, language, dark_mode, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    'local_user', 'MapJournal 用户', null, 'zh', 0, now, now
  );
  return {
    id: 'local_user', displayName: 'MapJournal 用户',
    avatarUri: null, language: 'zh', darkMode: false,
    createdAt: now, updatedAt: now,
  };
};

export const updateProfile = async (data: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const db = await getDatabase();
  const now = nowISO();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.displayName !== undefined) { fields.push('display_name = ?'); values.push(data.displayName); }
  if (data.avatarUri !== undefined) { fields.push('avatar_uri = ?'); values.push(data.avatarUri); }
  if (data.language !== undefined) { fields.push('language = ?'); values.push(data.language); }
  if (data.darkMode !== undefined) { fields.push('dark_mode = ?'); values.push(data.darkMode ? 1 : 0); }

  if (fields.length === 0) return;
  fields.push('updated_at = ?');
  values.push(now);
  values.push('local_user');

  await db.runAsync(`UPDATE user_profile SET ${fields.join(', ')} WHERE id = ?`, ...values);
};
