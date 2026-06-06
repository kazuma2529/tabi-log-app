import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type PremiumBenefitRowProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
};

export function PremiumBenefitRow({ icon, title, description }: PremiumBenefitRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={20} color={colors.accentTealDark} />
      </View>
      <View style={styles.text}>
        <Text selectable style={styles.title}>
          {title}
        </Text>
        <Text selectable style={styles.description}>
          {description}
        </Text>
      </View>
      <Ionicons name="checkmark-circle" size={20} color={colors.accentGold} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderColor: 'rgba(203, 163, 89, 0.42)',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 252, 243, 0.82)',
  },
  icon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: '#DDF0E9',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '900',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
});
