import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('mapjournal.db');
  await initDatabase(db);
  return db;
};

const initDatabase = async (database: SQLite.SQLiteDatabase) => {
  // 主表
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY NOT NULL,
      mood TEXT NOT NULL,
      emoji TEXT NOT NULL,
      note TEXT,
      photo_uri TEXT,
      voice_uri TEXT,
      activities TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 用户资料表
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      avatar_uri TEXT,
      language TEXT NOT NULL DEFAULT 'zh',
      dark_mode INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 自定义标签表
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS custom_tags (
      id TEXT PRIMARY KEY NOT NULL,
      icon TEXT NOT NULL,
      label TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // 好友表（占位）
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      avatar_uri TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );
  `);

  // 迁移：旧表新增列
  const migrations = [
    'ALTER TABLE entries ADD COLUMN activities TEXT;',
    'ALTER TABLE entries ADD COLUMN voice_uri TEXT;',
  ];
  for (const sql of migrations) {
    try { await database.execAsync(sql); } catch { /* 列已存在 */ }
  }
};
