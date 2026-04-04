import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('mapjournal.db');
  await initDatabase(db);
  return db;
};

const initDatabase = async (database: SQLite.SQLiteDatabase) => {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY NOT NULL,
      mood TEXT NOT NULL,
      emoji TEXT NOT NULL,
      note TEXT,
      photo_uri TEXT,
      activities TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 迁移：如果 activities 列不存在则添加
  try {
    await database.execAsync(`ALTER TABLE entries ADD COLUMN activities TEXT;`);
  } catch {
    // 列已存在，忽略
  }
};
