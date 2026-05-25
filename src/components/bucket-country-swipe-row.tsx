import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { colors, radius, spacing } from '@/theme';
import type { Country } from '@/types';

type BucketCountrySwipeRowProps = {
  country: Country;
  onOpenDetail: () => void;
  onConfirmDelete: (close: () => void) => void;
};

export function BucketCountrySwipeRow({ country, onOpenDetail, onConfirmDelete }: BucketCountrySwipeRowProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);

  function close() {
    swipeableRef.current?.close();
  }

  function renderRightActions() {
    return (
      <RectButton accessibilityRole="button" accessibilityLabel={`${country.nameJa}を削除`} style={styles.deleteAction} onPress={() => onConfirmDelete(close)}>
        <Ionicons name="trash-outline" size={22} color={colors.white} />
        <Text style={styles.deleteText}>削除</Text>
      </RectButton>
    );
  }

  return (
    <View style={styles.wrap}>
      <ReanimatedSwipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={1.6}
        rightThreshold={40}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${country.nameJa}を開く`}
          onPress={onOpenDetail}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={styles.flag}>{country.flag}</Text>
          <Text selectable style={styles.name} numberOfLines={1}>
            {country.nameJa}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </ReanimatedSwipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 250, 238, 0.94)',
  },
  row: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.82,
  },
  flag: {
    width: 38,
    fontSize: 30,
    textAlign: 'center',
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  deleteAction: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.danger,
  },
  deleteText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
});
