import { useCallback } from 'react';

/**
 * 「DB 操作 → refresh → 戻り値を返す」というラッパーパターンを 1 行で生成するためのヘルパー。
 *
 * 使い方：
 * ```ts
 * const addVisit = useRefreshingMutation(addVisitToDb, refresh);
 * ```
 *
 * 既存 17 個の useCallback と完全に同じ振る舞いをする。
 */
export function useRefreshingMutation<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  refresh: () => Promise<void>,
): (...args: Args) => Promise<Result> {
  return useCallback(
    async (...args: Args) => {
      const result = await fn(...args);
      await refresh();
      return result;
    },
    [fn, refresh],
  );
}
