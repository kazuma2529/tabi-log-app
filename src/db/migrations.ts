import { COUNTRIES } from '@/data';
import { deletePhotoFiles, nowISO } from '@/lib';

import type { Database } from './client';

export async function seedCountries(db: Database) {
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

export async function ensurePurchaseRow(db: Database) {
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM purchases WHERE id = ?',
    'local',
  );
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

export async function migratePhotoPathsToRelative(db: Database) {
  // 旧仕様で保存された絶対 file:// URI を相対パス（visit-photos/xxx）に揃える。
  // container UUID が変わると絶対パスが無効になるため、保存形式そのものを切り替える。
  await db.runAsync(
    `UPDATE photos
       SET uri = substr(uri, instr(uri, 'visit-photos/'))
     WHERE uri LIKE '%visit-photos/%'
       AND uri NOT LIKE 'visit-photos/%'`,
  );
}

export async function removeJapanLegacyData(db: Database) {
  // 旧仕様で日本を記録対象に含めていた時期のデータを除去する。
  // 「日本人ユーザー向け」コンセプトに合わせて、日本は記録対象から外す。
  const jpVisitIds = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM visits WHERE country_id = ?`,
    'jp',
  );
  if (jpVisitIds.length > 0) {
    const placeholders = jpVisitIds.map(() => '?').join(',');
    const ids = jpVisitIds.map((row) => row.id);
    const photos = await db.getAllAsync<{ uri: string }>(
      `SELECT uri FROM photos WHERE visit_id IN (${placeholders})`,
      ...ids,
    );
    await deletePhotoFiles(photos.map((p) => p.uri));
    await db.runAsync(`DELETE FROM visits WHERE country_id = ?`, 'jp');
  }
  await db.runAsync(`DELETE FROM bucket_list WHERE country_id = ?`, 'jp');
  await db.runAsync(`DELETE FROM bucket_memos WHERE country_id = ?`, 'jp');
  await db.runAsync(`DELETE FROM countries WHERE id = ?`, 'jp');
}
