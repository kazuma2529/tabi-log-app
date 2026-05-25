import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export function EmptyState({ icon = '🧳', title, body, onPress }: { icon?: string; title: string; body: string; onPress?: () => void }) {
  const content = (
    <>
      <Text style={styles.icon}>{icon}</Text>
      <Text selectable style={styles.title}>
        {title}
      </Text>
      <Text selectable style={styles.body}>
        {body}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 250, 238, 0.72)',
  },
  pressed: {
    opacity: 0.82,
  },
  icon: {
    fontSize: 34,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  body: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
