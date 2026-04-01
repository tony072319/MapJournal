import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

// 获取数据库实例（单例模式）
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('mapjournal.db');
  await initDatabase(db);
  return db;
};

// 初始化数据库表
const initDatabase = async (database: SQLite.SQLiteDatabase) => {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY NOT NULL,
      mood TEXT NOT NULL,
      emoji TEXT NOT NULL,
      note TEXT,
      photo_uri TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
};
