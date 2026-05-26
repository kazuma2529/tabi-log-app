import type { MemoType } from '@/types';

type MemoCardDefinition = {
  type: MemoType;
  title: string;
  icon: string;
  placeholder: string;
};

/**
 * `Record<MemoType, ...>` 型を満たすことで、`MemoType` リテラルを追加した瞬間にここでも
 * コンパイルエラーになり、追加忘れを検知できる。
 *
 * 表示順は `MEMO_CARD_DEFINITIONS` の配列順で固定したいので、こちらは index 付きで保持し、
 * 下で型エラーを起こさせるためだけに使う。
 */
const MEMO_CARD_BY_TYPE = {
  learned: {
    type: 'learned',
    title: '現地で学んだこと',
    icon: '📖',
    placeholder: '現地で知った習慣、言葉、考え方など',
  },
  food: {
    type: 'food',
    title: '美味しかった食べ物',
    icon: '🍲',
    placeholder: '料理名、店名、味の感想など',
  },
  culture_shock: {
    type: 'culture_shock',
    title: 'カルチャーショック',
    icon: '😯',
    placeholder: '日本との違いに驚いたこと',
  },
  free_note: {
    type: 'free_note',
    title: '自由メモ',
    icon: '✏️',
    placeholder: '残しておきたいことを自由に',
  },
  people: {
    type: 'people',
    title: '出会った人',
    icon: '👥',
    placeholder: '旅先で出会った人、会話、思い出など',
  },
  next_time: {
    type: 'next_time',
    title: '次回やりたいこと',
    icon: '⭐',
    placeholder: '次に行くならやりたいこと',
  },
} as const satisfies Record<MemoType, MemoCardDefinition>;

/**
 * 画面で使う「表示順込みの定義リスト」。並びはリファクタ前と同じ。
 */
export const MEMO_CARD_DEFINITIONS: readonly MemoCardDefinition[] = [
  MEMO_CARD_BY_TYPE.learned,
  MEMO_CARD_BY_TYPE.food,
  MEMO_CARD_BY_TYPE.culture_shock,
  MEMO_CARD_BY_TYPE.free_note,
  MEMO_CARD_BY_TYPE.people,
  MEMO_CARD_BY_TYPE.next_time,
];

export function getMemoDefinition(type: MemoType) {
  return MEMO_CARD_BY_TYPE[type];
}
