import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type VisitMediaAddButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'section' | 'album';
};

export function VisitMediaAddButton({ onPress, style, variant = 'section' }: VisitMediaAddButtonProps) {
  if (variant === 'album') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="写真や動画を追加"
        style={[styles.albumButton, style]}
        onPress={onPress}
      >
        <Text selectable style={styles.albumPlus}>
          ＋
        </Text>
        <Text selectable style={styles.albumLabel}>
          写真や動画を追加
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="写真や動画を追加"
      style={[styles.sectionButton, style]}
      onPress={onPress}
    >
      <Ionicons name="add" size={18} color={colors.accentTealDark} />
      <Text selectable style={styles.sectionLabel}>
        写真や動画を追加
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(47, 155, 145, 0.06)',
  },
  sectionLabel: {
    color: colors.accentTealDark,
    fontSize: 13,
    fontWeight: '800',
  },
  albumButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accentTealDark,
    backgroundColor: 'rgba(255, 248, 234, 0.96)',
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  albumPlus: {
    color: colors.accentTealDark,
    fontSize: 20,
    fontWeight: '700',
  },
  albumLabel: {
    color: colors.accentTealDark,
    fontSize: 14,
    fontWeight: '800',
  },
});
