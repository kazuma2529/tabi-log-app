import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing } from '@/theme';

type MediaProcessingIndicatorProps = {
  visible: boolean;
};

export function MediaProcessingIndicator({ visible }: MediaProcessingIndicatorProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View
      accessibilityLabel="写真や動画を準備しています"
      accessibilityRole="progressbar"
      pointerEvents="auto"
      style={styles.overlay}
    >
      <View style={[styles.card, { marginBottom: Math.max(insets.bottom, spacing.lg) + 72 }]}>
        <ActivityIndicator color={colors.accentTealDark} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>写真や動画を準備しています</Text>
          <Text style={styles.body}>iCloud上の素材は少し時間がかかることがあります</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 1000,
  },
  card: {
    maxWidth: 340,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(250, 246, 236, 0.98)',
    boxShadow: shadows.card,
  },
  textBlock: {
    flexShrink: 1,
    gap: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  body: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
