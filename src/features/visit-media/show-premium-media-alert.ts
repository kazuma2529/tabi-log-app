import { Alert } from 'react-native';

import {
  PREMIUM_MEDIA_LIMIT_BODY,
  PREMIUM_MEDIA_LIMIT_CTA,
  PREMIUM_MEDIA_LIMIT_TITLE,
  PREMIUM_REVENUECAT_PENDING_MESSAGE,
} from '@/lib';

type ShowPremiumMediaAlertOptions = {
  onUpgrade: () => void;
};

export function showPremiumMediaAlert({ onUpgrade }: ShowPremiumMediaAlertOptions) {
  Alert.alert(PREMIUM_MEDIA_LIMIT_TITLE, PREMIUM_MEDIA_LIMIT_BODY, [
    { text: 'あとで', style: 'cancel' },
    {
      text: PREMIUM_MEDIA_LIMIT_CTA,
      onPress: onUpgrade,
    },
  ]);
}

export function showPremiumPendingAfterUpgrade() {
  Alert.alert('RevenueCat 接続前です', PREMIUM_REVENUECAT_PENDING_MESSAGE);
}
