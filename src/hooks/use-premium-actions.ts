import { useCallback } from 'react';
import { Alert } from 'react-native';

import { isRevenueCatPurchaseCancelled } from '@/lib';

import { usePremium } from './use-premium';

export function usePremiumActions() {
  const { purchasePremium, restorePremium } = usePremium();

  const purchasePremiumWithFeedback = useCallback(async () => {
    try {
      const isPremium = await purchasePremium();
      if (isPremium) {
        Alert.alert(
          'プレミアム機能を解放しました',
          '訪問国と写真・動画を無制限に登録でき、年別分析も利用できるようになりました。',
        );
      } else {
        Alert.alert('購入を確認できませんでした', '時間をおいて、もう一度お試しください。');
      }
      return isPremium;
    } catch (error) {
      if (!isRevenueCatPurchaseCancelled(error)) {
        Alert.alert(
          '購入できませんでした',
          error instanceof Error ? error.message : '時間をおいて、もう一度お試しください。',
        );
      }
      return false;
    }
  }, [purchasePremium]);

  const restorePremiumWithFeedback = useCallback(async () => {
    try {
      const isPremium = await restorePremium();
      Alert.alert(
        isPremium ? '購入を復元しました' : '復元できる購入がありません',
        isPremium
          ? '訪問国と写真・動画を無制限に登録でき、年別分析も利用できるようになりました。'
          : 'このApple Accountで購入済みの商品は見つかりませんでした。',
      );
      return isPremium;
    } catch (error) {
      Alert.alert(
        '購入を復元できませんでした',
        error instanceof Error ? error.message : '時間をおいて、もう一度お試しください。',
      );
      return false;
    }
  }, [restorePremium]);

  return { purchasePremiumWithFeedback, restorePremiumWithFeedback };
}
