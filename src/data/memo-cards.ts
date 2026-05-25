import type { MemoType } from '@/types';

export const MEMO_CARD_DEFINITIONS: {
  type: MemoType;
  title: string;
  icon: string;
  placeholder: string;
}[] = [
  {
    type: 'learned',
    title: '現地で学んだこと',
    icon: '📖',
    placeholder: '現地で知った習慣、言葉、考え方など',
  },
  {
    type: 'food',
    title: '美味しかった食べ物',
    icon: '🍲',
    placeholder: '料理名、店名、味の感想など',
  },
  {
    type: 'culture_shock',
    title: 'カルチャーショック',
    icon: '😯',
    placeholder: '日本との違いに驚いたこと',
  },
  {
    type: 'free_note',
    title: '自由メモ',
    icon: '✏️',
    placeholder: '残しておきたいことを自由に',
  },
  {
    type: 'people',
    title: '出会った人',
    icon: '👥',
    placeholder: '旅先で出会った人、会話、思い出など',
  },
  {
    type: 'next_time',
    title: '次回やりたいこと',
    icon: '⭐',
    placeholder: '次に行くならやりたいこと',
  },
];

export function getMemoDefinition(type: MemoType) {
  return MEMO_CARD_DEFINITIONS.find((definition) => definition.type === type);
}
