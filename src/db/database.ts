import * as SQLite from 'expo-sqlite';

import { COUNTRIES } from '@/data';
import { createId, deletePhotoFiles, nowISO, resolvePhotoUri, toRelativePhotoPath } from '@/lib';
import type { AddVisitInput, BucketListItem, BucketMemo, City, MemoCard, MemoType, Photo, PurchaseState, TravelData, Visit } from '@/types';

type Database = SQLite.SQLiteDatabase;

let databasePromise: Promise<Database> | null = null;

function getDatabase() {
  databasePromise ??= SQLite.openDatabaseAsync('tabi-log.db');
  return databasePromise;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
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
  `);

  await seedCountries(db);
  await ensurePurchaseRow(db);
  await migratePhotoPathsToRelative(db);
}

async function migratePhotoPathsToRelative(db: Database) {
  // 旧仕様で保存された絶対 file:// URI を相対パス（visit-photos/xxx）に揃える。
  // container UUID が変わると絶対パスが無効になるため、保存形式そのものを切り替える。
  await db.runAsync(
    `UPDATE photos
       SET uri = substr(uri, instr(uri, 'visit-photos/'))
     WHERE uri LIKE '%visit-photos/%'
       AND uri NOT LIKE 'visit-photos/%'`,
  );
}

async function seedCountries(db: Database) {
  for (const country of COUNTRIES) {
    await db.runAsync(
      `
      INSERT OR REPLACE INTO countries
        (id, name_ja, name_en, flag, region, continent, iso_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      country.id,
      country.nameJa,
      country.nameEn,
      country.flag,
      country.region,
      country.continent,
      country.isoCode,
    );
  }
}

async function ensurePurchaseRow(db: Database) {
  const existing = await db.getFirstAsync<{ id: string }>('SELECT id FROM purchases WHERE id = ?', 'local');
  if (!existing) {
    await db.runAsync(
      'INSERT INTO purchases (id, is_premium, entitlement_id, updated_at) VALUES (?, ?, ?, ?)',
      'local',
      0,
      null,
      nowISO(),
    );
  }
}

export async function getTravelData(): Promise<TravelData> {
  const db = await getDatabase();

  const [visits, cities, photoRows, memoCards, bucketList, bucketMemoRows, purchaseRow] = await Promise.all([
    db.getAllAsync<Visit>('SELECT id, country_id as countryId, visited_at as visitedAt, visit_order as visitOrder, created_at as createdAt, updated_at as updatedAt FROM visits ORDER BY visited_at ASC, created_at ASC'),
    db.getAllAsync<City>('SELECT id, visit_id as visitId, name, created_at as createdAt FROM cities ORDER BY created_at ASC'),
    db.getAllAsync<Photo>('SELECT id, visit_id as visitId, uri, created_at as createdAt FROM photos ORDER BY created_at ASC'),
    db.getAllAsync<MemoCard>('SELECT id, visit_id as visitId, type, content, created_at as createdAt, updated_at as updatedAt FROM memo_cards ORDER BY created_at ASC'),
    db.getAllAsync<BucketListItem>('SELECT id, country_id as countryId, created_at as createdAt FROM bucket_list ORDER BY created_at ASC'),
    db.getAllAsync<{ id: string; countryId: string; content: string; isDone: number; createdAt: string; updatedAt: string }>(
      'SELECT id, country_id as countryId, content, is_done as isDone, created_at as createdAt, updated_at as updatedAt FROM bucket_memos ORDER BY created_at ASC',
    ),
    db.getFirstAsync<{ isPremium: number; entitlementId: string | null; updatedAt: string }>(
      'SELECT is_premium as isPremium, entitlement_id as entitlementId, updated_at as updatedAt FROM purchases WHERE id = ?',
      'local',
    ),
  ]);

  const purchase: PurchaseState = {
    isPremium: Boolean(purchaseRow?.isPremium),
    entitlementId: purchaseRow?.entitlementId ?? null,
    updatedAt: purchaseRow?.updatedAt ?? nowISO(),
  };

  const bucketMemos: BucketMemo[] = bucketMemoRows.map((row) => ({
    id: row.id,
    countryId: row.countryId,
    content: row.content,
    isDone: Boolean(row.isDone),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  // DB に保存されているのは相対パス（visit-photos/xxx）想定だが、
  // 表示側では現在の documentDirectory に解決した絶対 URI を返す。
  const photos: Photo[] = photoRows.map((row) => ({
    ...row,
    uri: resolvePhotoUri(row.uri),
  }));

  return {
    visits,
    cities,
    photos,
    memoCards,
    bucketList,
    bucketMemos,
    purchase,
  };
}

export async function addVisit(input: AddVisitInput) {
  const db = await getDatabase();
  const timestamp = nowISO();
  const visitId = createId('visit');
  const count = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM visits WHERE country_id = ?',
    input.countryId,
  );
  const visitOrder = (count?.count ?? 0) + 1;

  await db.runAsync(
    'INSERT INTO visits (id, country_id, visited_at, visit_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    visitId,
    input.countryId,
    input.visitedAt,
    visitOrder,
    timestamp,
    timestamp,
  );

  for (const cityName of input.cityNames.filter(Boolean)) {
    await db.runAsync(
      'INSERT INTO cities (id, visit_id, name, created_at) VALUES (?, ?, ?, ?)',
      createId('city'),
      visitId,
      cityName,
      timestamp,
    );
  }

  for (const uri of input.photoUris.filter(Boolean)) {
    await db.runAsync(
      'INSERT INTO photos (id, visit_id, uri, created_at) VALUES (?, ?, ?, ?)',
      createId('photo'),
      visitId,
      toRelativePhotoPath(uri),
      timestamp,
    );
  }

  for (const memo of input.memos.filter((item) => item.content.trim().length > 0)) {
    await db.runAsync(
      'INSERT INTO memo_cards (id, visit_id, type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      createId('memo'),
      visitId,
      memo.type,
      memo.content.trim(),
      timestamp,
      timestamp,
    );
  }

  await db.runAsync('DELETE FROM bucket_list WHERE country_id = ?', input.countryId);

  return visitId;
}

export async function updateVisitDate(visitId: string, visitedAt: string) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE visits SET visited_at = ?, updated_at = ? WHERE id = ?',
    visitedAt,
    nowISO(),
    visitId,
  );
}

export async function addCity(visitId: string, name: string): Promise<City | null> {
  const trimmed = name.trim();
  if (trimmed.length === 0) return null;

  const db = await getDatabase();
  const id = createId('city');
  const createdAt = nowISO();
  await db.runAsync(
    'INSERT INTO cities (id, visit_id, name, created_at) VALUES (?, ?, ?, ?)',
    id,
    visitId,
    trimmed,
    createdAt,
  );
  return { id, visitId, name: trimmed, createdAt };
}

export async function removeCity(cityId: string): Promise<City | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: string; visitId: string; name: string; createdAt: string }>(
    'SELECT id, visit_id as visitId, name, created_at as createdAt FROM cities WHERE id = ?',
    cityId,
  );
  if (!row) return null;
  await db.runAsync('DELETE FROM cities WHERE id = ?', cityId);
  return row;
}

export async function restoreCity(city: City) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO cities (id, visit_id, name, created_at) VALUES (?, ?, ?, ?)',
    city.id,
    city.visitId,
    city.name,
    city.createdAt,
  );
}

export async function addPhotosToVisit(visitId: string, uris: string[]): Promise<Photo[]> {
  if (uris.length === 0) return [];
  const db = await getDatabase();
  const createdAt = nowISO();
  const inserted: Photo[] = [];

  for (const rawUri of uris.filter(Boolean)) {
    const id = createId('photo');
    const relative = toRelativePhotoPath(rawUri);
    await db.runAsync(
      'INSERT INTO photos (id, visit_id, uri, created_at) VALUES (?, ?, ?, ?)',
      id,
      visitId,
      relative,
      createdAt,
    );
    inserted.push({ id, visitId, uri: resolvePhotoUri(relative), createdAt });
  }

  return inserted;
}

export async function removePhoto(photoId: string): Promise<Photo | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: string; visitId: string; uri: string; createdAt: string }>(
    'SELECT id, visit_id as visitId, uri, created_at as createdAt FROM photos WHERE id = ?',
    photoId,
  );
  if (!row) return null;
  await db.runAsync('DELETE FROM photos WHERE id = ?', photoId);
  // 物理ファイルは Undo の猶予のためここでは消さず、purgePhotoFile で消す。
  return { ...row, uri: resolvePhotoUri(row.uri) };
}

export async function restorePhoto(photo: Photo) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO photos (id, visit_id, uri, created_at) VALUES (?, ?, ?, ?)',
    photo.id,
    photo.visitId,
    toRelativePhotoPath(photo.uri),
    photo.createdAt,
  );
}

export async function purgePhotoFile(storedUri: string) {
  await deletePhotoFiles([storedUri]);
}

export async function addMemo(visitId: string, type: MemoType, content = ''): Promise<MemoCard> {
  const db = await getDatabase();
  const id = createId('memo');
  const timestamp = nowISO();
  await db.runAsync(
    'INSERT INTO memo_cards (id, visit_id, type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    visitId,
    type,
    content,
    timestamp,
    timestamp,
  );
  return { id, visitId, type, content, createdAt: timestamp, updatedAt: timestamp };
}

export async function updateMemoContent(memoId: string, content: string) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE memo_cards SET content = ?, updated_at = ? WHERE id = ?',
    content,
    nowISO(),
    memoId,
  );
}

export async function removeMemo(memoId: string): Promise<MemoCard | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ id: string; visitId: string; type: MemoType; content: string; createdAt: string; updatedAt: string }>(
    'SELECT id, visit_id as visitId, type, content, created_at as createdAt, updated_at as updatedAt FROM memo_cards WHERE id = ?',
    memoId,
  );
  if (!row) return null;
  await db.runAsync('DELETE FROM memo_cards WHERE id = ?', memoId);
  return row;
}

export async function restoreMemo(memo: MemoCard) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO memo_cards (id, visit_id, type, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    memo.id,
    memo.visitId,
    memo.type,
    memo.content,
    memo.createdAt,
    memo.updatedAt,
  );
}

export async function removeVisit(visitId: string) {
  const db = await getDatabase();

  const photoRows = await db.getAllAsync<{ uri: string }>(
    'SELECT uri FROM photos WHERE visit_id = ?',
    visitId,
  );

  // CASCADE で cities / photos / memo_cards も同時に削除される。
  await db.runAsync('DELETE FROM visits WHERE id = ?', visitId);

  if (photoRows.length > 0) {
    await deletePhotoFiles(photoRows.map((row) => row.uri));
  }
}

export async function addBucketCountry(countryId: string) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR IGNORE INTO bucket_list (id, country_id, created_at) VALUES (?, ?, ?)',
    createId('bucket'),
    countryId,
    nowISO(),
  );
}

export async function removeBucketCountry(countryId: string) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bucket_list WHERE country_id = ?', countryId);
  await db.runAsync('DELETE FROM bucket_memos WHERE country_id = ?', countryId);
}

export async function addBucketMemo(countryId: string, content: string) {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return null;
  }
  const db = await getDatabase();
  const id = createId('bmemo');
  const timestamp = nowISO();
  await db.runAsync(
    'INSERT INTO bucket_memos (id, country_id, content, is_done, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    countryId,
    trimmed,
    0,
    timestamp,
    timestamp,
  );
  return id;
}

export async function removeBucketMemo(memoId: string) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM bucket_memos WHERE id = ?', memoId);
}

export async function setBucketMemoDone(memoId: string, isDone: boolean) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE bucket_memos SET is_done = ?, updated_at = ? WHERE id = ?',
    isDone ? 1 : 0,
    nowISO(),
    memoId,
  );
}

export async function setPremiumForDevelopment(isPremium: boolean) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE purchases SET is_premium = ?, updated_at = ? WHERE id = ?',
    isPremium ? 1 : 0,
    nowISO(),
    'local',
  );
}
