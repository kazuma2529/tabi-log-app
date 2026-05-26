import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PREMIUM_UNLOCK_SHORT_COPY } from '@/lib';
import { colors, radius, spacing } from '@/theme';

import { PaperCard } from './paper-card';
import { PrimaryButton } from './primary-button';

type PremiumUpgradeCardProps = {
  title?: string;
  body?: string;
  onPurchasePress: () => void;
  onRestorePress: () => void;
  onEnableDevelopmentPremium?: () => void;
};

export function PremiumUpgradeCard({
  title = '有料版で解放されます',
  body = PREMIUM_UNLOCK_SHORT_COPY,
  onPurchasePress,
  onRestorePress,
  onEnableDevelopmentPremium,
}: PremiumUpgradeCardProps) {
  return (
    <PaperCard style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={24} color={colors.accentGold} />
      </View>
      <View style={styles.textBlock}>
        <Text selectable style={styles.title}>
          {title}
        </Text>
        <Text selectable style={styles.body}>
          {body}
        </Text>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="有料版を購入" onPress={onPurchasePress} />
        <PrimaryButton label="購入を復元" variant="secondary" onPress={onRestorePress} />
        {onEnableDevelopmentPremium ? (
          <PrimaryButton
            label="開発用：有料表示にする"
            variant="secondary"
            onPress={onEnableDevelopmentPremium}
          />
        ) : null}
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    backgroundColor: 'rgba(255, 240, 214, 0.94)',
    borderColor: '#DDBB78',
  },
  iconWrap: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: '#F8DFA7',
  },
  textBlock: {
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  body: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  actions: {
    gap: spacing.sm,
  },
});
