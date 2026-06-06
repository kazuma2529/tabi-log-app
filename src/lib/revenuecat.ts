import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

import { PREMIUM_ENTITLEMENT_ID, PREMIUM_PRODUCT_ID } from './premium';

const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim();

let isConfigured = false;

export function hasRevenueCatApiKey() {
  return Boolean(REVENUECAT_IOS_API_KEY);
}

export async function configureRevenueCat() {
  if (isConfigured) return;
  if (Platform.OS !== 'ios') {
    throw new Error('RevenueCat は iOS でのみ利用できます。');
  }
  if (!REVENUECAT_IOS_API_KEY) {
    throw new Error('RevenueCat の iOS Public SDK API Key が未設定です。');
  }
  if (REVENUECAT_IOS_API_KEY.startsWith('test_')) {
    throw new Error(
      'RevenueCat Test Store用のAPI Keyではなく、Tabi Log iOS用のPublic SDK API Keyを設定してください。',
    );
  }
  if (await Purchases.isConfigured()) {
    isConfigured = true;
    return;
  }

  if (__DEV__) {
    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }
  Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
  isConfigured = true;
}

export async function getRevenueCatPremiumState() {
  await configureRevenueCat();
  const customerInfo = await Purchases.getCustomerInfo();
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}

export async function purchaseRevenueCatPremium() {
  await configureRevenueCat();
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current ?? offerings.all.default;
  const premiumPackage = offering?.availablePackages.find(
    (item) => item.product.identifier === PREMIUM_PRODUCT_ID,
  );

  if (!premiumPackage) {
    throw new Error('購入商品を取得できませんでした。RevenueCat の Offering 設定を確認してください。');
  }

  const { customerInfo } = await Purchases.purchasePackage(premiumPackage);
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}

export async function restoreRevenueCatPremium() {
  await configureRevenueCat();
  const customerInfo = await Purchases.restorePurchases();
  return Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
}

export function isRevenueCatPurchaseCancelled(error: unknown) {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'userCancelled' in error &&
      (error as { userCancelled?: boolean }).userCancelled,
  );
}
