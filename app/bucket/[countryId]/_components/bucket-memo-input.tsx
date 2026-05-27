import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PaperCard } from '@/components';
import { colors, radius, shadows, spacing } from '@/theme';

type BucketMemoInputProps = {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
};

export function BucketMemoInput({ value, onChange, onSubmit }: BucketMemoInputProps) {
  const disabled = value.trim().length === 0;

  return (
    <PaperCard inset style={styles.addCard}>
      <View style={styles.addInputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="例：エッフェル塔に登る"
          placeholderTextColor={colors.textMuted}
          style={styles.addInput}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="追加"
          onPress={onSubmit}
          disabled={disabled}
          style={({ pressed }) => [
            styles.addButton,
            disabled && styles.addButtonDisabled,
            pressed && !disabled && styles.addButtonPressed,
          ]}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </Pressable>
      </View>
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  addCard: {
    paddingVertical: spacing.md,
  },
  addInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    minHeight: 44,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    backgroundColor: colors.accentTeal,
    boxShadow: shadows.button,
  },
  addButtonDisabled: {
    opacity: 0.45,
  },
  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
