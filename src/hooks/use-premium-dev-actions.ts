import { useCallback } from 'react';
import { Alert } from 'react-native';

import { PREMIUM_REVENUECAT_PENDING_MESSAGE } from '@/lib';

import { usePremium } from './use-premium';

type UsePremiumDevActionsOptions = {
  /** `Alert.alert('有料表示にしました', ...)` の本文。画面ごとに変える。 */
  enableMessage: string;
};

const DISABLE_MESSAGE = '開発用フラグをオフにしました。';

/**
 * 開発用に有料表示フラグを切り替えるためのハンドラ群を返すフック。
 * stats / yearly-analysis 画面で重複していた 3 関数を集約する。
 *
 * 本物の課金接続（Phase 15 / RevenueCat）を導入する際はこのフックの内部だけ差し替える。
 */
export function usePremiumDevActions({ enableMessage }: UsePremiumDevActionsOptions) {
  const { setDevelopmentPremium } = usePremium();

  const showRevenueCatPending = useCallback(() => {
    Alert.alert('RevenueCat 接続前です', PREMIUM_REVENUECAT_PENDING_MESSAGE);
  }, []);

  const enableDevelopmentPremium = useCallback(async () => {
    await setDevelopmentPremium(true);
    Alert.alert('有料表示にしました', enableMessage);
  }, [enableMessage, setDevelopmentPremium]);

  const disableDevelopmentPremium = useCallback(async () => {
    await setDevelopmentPremium(false);
    Alert.alert('無料表示に戻しました', DISABLE_MESSAGE);
  }, [setDevelopmentPremium]);

  return { showRevenueCatPending, enableDevelopmentPremium, disableDevelopmentPremium };
}
