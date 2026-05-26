import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

type PaperCardProps = ViewProps & {
  inset?: boolean;
};

export function PaperCard({ style, inset = false, ...props }: PaperCardProps) {
  return <View style={[styles.card, inset && styles.inset, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    boxShadow: shadows.card,
  },
  inset: {
    backgroundColor: colors.backgroundSoft,
    boxShadow: shadows.soft,
  },
});
