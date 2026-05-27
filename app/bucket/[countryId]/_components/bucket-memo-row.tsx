import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';
import type { BucketMemo } from '@/types';

type BucketMemoRowProps = {
  memo: BucketMemo;
  onToggle: () => void;
  onRemove: () => void;
};

export function BucketMemoRow({ memo, onToggle, onRemove }: BucketMemoRowProps) {
  return (
    <View style={styles.memoRow}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: memo.isDone }}
        accessibilityLabel={memo.isDone ? '達成を取り消す' : '達成にする'}
        onPress={onToggle}
        style={({ pressed }) => [styles.checkbox, memo.isDone && styles.checkboxChecked, pressed && styles.pressed]}
      >
        {memo.isDone ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
      </Pressable>
      <Text selectable style={[styles.memoText, memo.isDone && styles.memoTextDone]} numberOfLines={2}>
        {memo.content}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="削除"
        onPress={onRemove}
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
      >
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  memoRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    boxShadow: shadows.soft,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.accentTealDark,
    backgroundColor: colors.paper,
  },
  checkboxChecked: {
    backgroundColor: colors.accentTeal,
    borderColor: colors.accentTealDark,
  },
  memoText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  memoTextDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.border,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
