import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { Country } from '@/types';

type CountryRowProps = Omit<PressableProps, 'style'> & {
  country: Country;
  meta?: string;
  trailing?: string;
  selected?: boolean;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  variant?: 'card' | 'list';
  style?: StyleProp<ViewStyle>;
};

export function CountryRow({ country, meta, trailing, selected, actionIcon = 'chevron-forward', variant = 'card', style, ...props }: CountryRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, variant === 'list' && styles.listRow, selected && styles.selected, pressed && styles.pressed, style]}
      {...props}
    >
      <Text style={[styles.flag, variant === 'list' && styles.listFlag]}>{country.flag}</Text>
      <View style={styles.textBlock}>
        <Text selectable style={styles.name}>
          {country.nameJa}
        </Text>
        {meta ? (
          <Text selectable style={styles.meta}>
            {meta}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <Text selectable style={styles.trailing}>
          {trailing}
        </Text>
      ) : null}
      <Ionicons name={actionIcon} size={18} color={selected ? colors.accentTealDark : colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 250, 238, 0.94)',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  listRow: {
    minHeight: 52,
    paddingHorizontal: 4,
    paddingVertical: spacing.xs,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderRadius: 0,
  },
  selected: {
    borderColor: colors.accentTeal,
    backgroundColor: '#E8F5F1',
  },
  pressed: {
    opacity: 0.82,
  },
  flag: {
    fontSize: 30,
    width: 38,
    textAlign: 'center',
  },
  listFlag: {
    fontSize: 26,
    width: 34,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  trailing: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
