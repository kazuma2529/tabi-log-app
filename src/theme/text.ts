import type { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * 既存 StyleSheet にハードコードされた `fontSize` / `fontWeight` / `color` の組み合わせのうち、
 * 「screen をまたいで何度も同じ値になっているもの」だけをまとめた共有プリセット。
 * 既存挙動・見た目を変えないため、現状値をそのまま固定値として持つ。
 */
export const text = {
  // screen タイトル系
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  } satisfies TextStyle,

  // セクション見出し系（PaperCard 内のタイトルなど）
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
  } satisfies TextStyle,

  // 「すべて見る ›」のような淡いリンク文言
  linkSmall: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  } satisfies TextStyle,

  // 国詳細などで使う「国名」級の見出し
  countryName: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  } satisfies TextStyle,

  // 国詳細で「{region}・{nameEn}」のような補足
  countryMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  } satisfies TextStyle,
} as const;
