export const STEP_TITLES = ['国を選択', '訪問日と都市', '写真を追加', 'メモを選択', 'メモを入力', '登録完了'] as const;

export type CountryFilter = 'all' | 'visited' | 'unvisited';
