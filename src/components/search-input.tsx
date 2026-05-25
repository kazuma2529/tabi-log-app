import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function SearchInput(props: TextInputProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCorrect={false}
        clearButtonMode="while-editing"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 250, 238, 0.92)',
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 44,
  },
});
