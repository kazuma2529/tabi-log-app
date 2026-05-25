import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

type PrimaryButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, variant = 'primary', loading, disabled, style, ...props }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? <ActivityIndicator color={variant === 'primary' ? colors.white : colors.accentTealDark} /> : null}
      <Text style={[styles.label, variant !== 'primary' && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.accentTeal,
    boxShadow: shadows.button,
  },
  secondary: {
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: '#F8E7DF',
    borderColor: '#E7B7A6',
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.46,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryLabel: {
    color: colors.textPrimary,
  },
});
