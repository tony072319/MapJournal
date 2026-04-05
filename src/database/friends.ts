import { getDatabase } from './db';
import { Friend } from '../types';
import { generateId } from '../utils/uuid';
import { nowISO } from '../utils/dateFormat';

// 占位：好友功能需要后端，这里只是本地数据模型
export const getAllFriends = async (): Promise<Friend[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM friends ORDER BY created_at DESC');
  return rows.map((row: any) => ({
    id: row.id,
    displayName: row.display_name,
    avatarUri: row.avatar_uri,
    status: row.status as Friend['status'],
    createdAt: row.created_at,
  }));
};

export const addFriend = async (displayName: string): Promise<Friend> => {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  await db.runAsync(
    'INSERT INTO friends (id, display_name, avatar_uri, status, created_at) VALUES (?, ?, ?, ?, ?)',
    id, displayName, null, 'pending', now
  );
  return { id, displayName, avatarUri: null, status: 'pending', createdAt: now };
};

export const removeFriend = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM friends WHERE id = ?', id);
};
