import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';

import { PaperCard } from '@/components';
import { colors, spacing } from '@/theme';

type MetricCardProps = {
  label: string;
  value: string;
  suffix: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function MetricCard({ label, value, suffix, icon }: MetricCardProps) {
  return (
    <PaperCard inset style={styles.metricCard}>
      <Ionicons name={icon} size={18} color={colors.accentTealDark} />
      <Text selectable style={styles.metricLabel}>
        {label}
      </Text>
      <Text selectable style={styles.metricValue}>
        {value}
        <Text style={styles.metricSuffix}> {suffix}</Text>
      </Text>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    flex: 1,
    minHeight: 116,
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 249, 238, 0.94)',
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 16,
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  metricSuffix: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
});
