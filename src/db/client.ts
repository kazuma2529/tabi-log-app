import * as SQLite from 'expo-sqlite';

export type Database = SQLite.SQLiteDatabase;

let databasePromise: Promise<Database> | null = null;

export function getDatabase(): Promise<Database> {
  databasePromise ??= SQLite.openDatabaseAsync('tabi-log.db');
  return databasePromise;
}

const SCHEMA_DDL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY NOT NULL,
    name_ja TEXT NOT NULL,
    name_en TEXT NOT NULL,
    flag TEXT NOT NULL,
    region TEXT NOT NULL,
    continent TEXT NOT NULL,
    iso_code TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS visits (
    id TEXT PRIMARY KEY NOT NULL,
    country_id TEXT NOT NULL,
    visited_at TEXT NOT NULL,
    visit_order INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY NOT NULL,
    visit_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY NOT NULL,
    visit_id TEXT NOT NULL,
    uri TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS memo_cards (
    id TEXT PRIMARY KEY NOT NULL,
    visit_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bucket_list (
    id TEXT PRIMARY KEY NOT NULL,
    country_id TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bucket_memos (
    id TEXT PRIMARY KEY NOT NULL,
    country_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY NOT NULL,
    is_premium INTEGER NOT NULL DEFAULT 0,
    entitlement_id TEXT,
    updated_at TEXT NOT NULL
  );
`;

export async function applySchema(db: Database) {
  await db.execAsync(SCHEMA_DDL);
}
