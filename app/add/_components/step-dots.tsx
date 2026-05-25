import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { STEP_TITLES } from '../_constants';

export function StepDots({ step }: { step: number }) {
  return (
    <View style={styles.dots}>
      {STEP_TITLES.map((_, index) => (
        <View key={index} style={[styles.dot, index <= step && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E4D3B6',
  },
  dotActive: {
    backgroundColor: colors.accentTeal,
  },
});
