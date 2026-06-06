import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { PaperCard } from './paper-card';
import { PremiumBenefitRow } from './premium-benefit-row';
import { PrimaryButton } from './primary-button';

type PremiumUpgradeCardProps = {
  title?: string;
  onPurchasePress: () => void;
  onRestorePress: () => void;
};

export function PremiumUpgradeCard({
  title = 'プレミアム機能',
  onPurchasePress,
  onRestorePress,
}: PremiumUpgradeCardProps) {
  return (
    <PaperCard style={styles.card}>
      <View pointerEvents="none" style={styles.decorationTop} />
      <View pointerEvents="none" style={styles.decorationBottom} />

      <View style={styles.header}>
        <View style={styles.iconMedallion}>
          <View style={styles.iconInner}>
            <Ionicons name="lock-closed" size={24} color="#FFF8E8" />
          </View>
          <View style={styles.sparkle}>
            <Ionicons name="sparkles" size={15} color="#FFF3C8" />
          </View>
        </View>
        <Text selectable style={styles.eyebrow}>
          旅ログ PREMIUM
        </Text>
        <Text selectable style={styles.title}>
          {title}
        </Text>
        <Text selectable style={styles.subtitle}>
          旅の記録を、これからも自由に。
        </Text>
      </View>

      <View style={styles.benefits}>
        <PremiumBenefitRow
          icon="earth-outline"
          title="訪問国を無制限に"
          description="6カ国目以降も自由に登録"
        />
        <PremiumBenefitRow
          icon="images-outline"
          title="写真・動画を無制限に"
          description="枚数を気にせず思い出を保存"
        />
        <PremiumBenefitRow
          icon="analytics-outline"
          title="年別分析を解放"
          description="訪問国・新規訪問国・旅の推移を振り返る"
        />
      </View>

      <View style={styles.pricePanel}>
        <View>
          <Text selectable style={styles.priceLabel}>
            一度きりのお支払い
          </Text>
          <Text selectable style={styles.priceNote}>
            追加料金なしの買い切り
          </Text>
        </View>
        <Text selectable style={styles.price}>
          980円
        </Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="プレミアム機能を購入" onPress={onPurchasePress} />
        <Pressable accessibilityRole="button" onPress={onRestorePress} style={styles.restoreButton}>
          <Text style={styles.restoreText}>購入済みの方はこちらから復元</Text>
        </Pressable>
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    gap: spacing.lg,
    backgroundColor: 'rgba(255, 246, 226, 0.97)',
    borderColor: '#CF9E48',
    borderWidth: 1.5,
    boxShadow: '0 8px 24px rgba(112, 72, 20, 0.20)',
  },
  decorationTop: {
    position: 'absolute',
    top: -76,
    right: -58,
    width: 170,
    height: 170,
    borderRadius: radius.round,
    backgroundColor: 'rgba(233, 187, 99, 0.16)',
  },
  decorationBottom: {
    position: 'absolute',
    bottom: 70,
    left: -75,
    width: 150,
    height: 150,
    borderRadius: radius.round,
    backgroundColor: 'rgba(47, 155, 145, 0.08)',
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconMedallion: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    borderColor: '#D7A64A',
    borderWidth: 1,
    backgroundColor: '#F8E4B4',
    boxShadow: '0 5px 14px rgba(132, 82, 19, 0.24)',
  },
  iconInner: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: colors.accentGold,
    borderColor: '#F5D994',
    borderWidth: 2,
  },
  sparkle: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: '#B67A25',
    borderColor: '#F7DB98',
    borderWidth: 1,
  },
  eyebrow: {
    marginTop: spacing.sm,
    color: colors.accentGold,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  benefits: {
    gap: spacing.sm,
  },
  pricePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#F2E3C0',
    borderColor: '#D5B573',
    borderWidth: 1,
  },
  priceLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  priceNote: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  price: {
    color: colors.accentGold,
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  actions: {
    gap: spacing.sm,
  },
  restoreButton: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  restoreText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
