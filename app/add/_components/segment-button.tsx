import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/theme';

export function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.button, active && styles.buttonActive]} onPress={onPress}>
      <Text selectable style={[styles.text, active && styles.textActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 34,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.accentTeal,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  textActive: {
    color: colors.white,
  },
});
