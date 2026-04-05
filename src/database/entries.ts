import { getDatabase } from './db';
import { Entry, NewEntry } from '../types';
import { generateId } from '../utils/uuid';
import { nowISO } from '../utils/dateFormat';

const rowToEntry = (row: any): Entry => ({
  id: row.id,
  mood: row.mood,
  emoji: row.emoji,
  note: row.note,
  photoUri: row.photo_uri,
  voiceUri: row.voice_uri,
  activities: row.activities,
  latitude: row.latitude,
  longitude: row.longitude,
  address: row.address,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const getAllEntries = async (): Promise<Entry[]> => {
  const db = await getDatabase();
  const rows = await db.getAllAsync('SELECT * FROM entries ORDER BY created_at DESC');
  return rows.map(rowToEntry);
};

export const createEntry = async (data: NewEntry): Promise<Entry> => {
  const db = await getDatabase();
  const id = generateId();
  const now = nowISO();
  const activitiesJson = data.activities && data.activities.length > 0
    ? JSON.stringify(data.activities) : null;

  await db.runAsync(
    `INSERT INTO entries (id, mood, emoji, note, photo_uri, voice_uri, activities, latitude, longitude, address, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, data.mood, data.emoji, data.note || null, data.photoUri || null,
    data.voiceUri || null, activitiesJson,
    data.latitude, data.longitude, data.address || null, now, now
  );

  return {
    id, mood: data.mood, emoji: data.emoji,
    note: data.note || null, photoUri: data.photoUri || null,
    voiceUri: data.voiceUri || null, activities: activitiesJson,
    latitude: data.latitude, longitude: data.longitude,
    address: data.address || null, createdAt: now, updatedAt: now,
  };
};

export const deleteEntry = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM entries WHERE id = ?', id);
};

export const updateEntry = async (id: string, data: Partial<NewEntry>): Promise<void> => {
  const db = await getDatabase();
  const now = nowISO();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.mood !== undefined) { fields.push('mood = ?'); values.push(data.mood); }
  if (data.emoji !== undefined) { fields.push('emoji = ?'); values.push(data.emoji); }
  if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }
  if (data.photoUri !== undefined) { fields.push('photo_uri = ?'); values.push(data.photoUri); }
  if (data.voiceUri !== undefined) { fields.push('voice_uri = ?'); values.push(data.voiceUri); }
  if (data.activities !== undefined) {
    fields.push('activities = ?');
    values.push(data.activities.length > 0 ? JSON.stringify(data.activities) : null);
  }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE entries SET ${fields.join(', ')} WHERE id = ?`, ...values);
};
