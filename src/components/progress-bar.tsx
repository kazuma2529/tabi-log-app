import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export function ProgressBar({ value, color = colors.accentTeal }: { value: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: '#EAD9B8',
    borderWidth: 1,
    borderColor: '#DBC398',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
