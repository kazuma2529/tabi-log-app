import { createId, nowISO } from '@/lib';
import type { MemoCard, MemoType } from '@/types';

import { getDatabase } from './client';

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
