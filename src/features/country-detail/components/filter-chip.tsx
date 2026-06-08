import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type FilterChipProps = {
  label: string;
  active: boolean;
  icon?: string;
  onPress: () => void;
};

export function FilterChip({ label, active, icon, onPress }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}で絞り込む`}
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text selectable style={[styles.text, active && styles.textActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 34,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  chipActive: {
    backgroundColor: colors.accentTealDark,
    borderColor: colors.accentTealDark,
  },
  icon: {
    fontSize: 14,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  textActive: {
    color: colors.white,
  },
});
