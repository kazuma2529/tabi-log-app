import { useCallback } from 'react';
import { Alert } from 'react-native';

import { useTravel } from '@/hooks';
import type { Country } from '@/types';

/**
 * バケットリスト国の削除確認ダイアログを返す。
 * 同じアラート文言・挙動を複数画面（ホーム / バケット一覧）で共有するための薄いラッパー。
 */
export function useConfirmBucketDelete() {
  const { removeBucketCountry } = useTravel();

  return useCallback(
    (country: Country, close: () => void) => {
      Alert.alert(
        `${country.nameJa}をリストから外しますか？`,
        'この国の「行ってみたいこと」も一緒に削除されます。',
        [
          { text: 'キャンセル', style: 'cancel', onPress: close },
          {
            text: '削除',
            style: 'destructive',
            onPress: async () => {
              close();
              await removeBucketCountry(country.id);
            },
          },
        ],
      );
    },
    [removeBucketCountry],
  );
}
