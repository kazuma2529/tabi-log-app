import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDateSlash, fromISODate } from '@/lib';
import { colors, radius, spacing } from '@/theme';

type VisitDateRowProps = {
  visitedAt: string;
  isDatePickerOpen: boolean;
  onToggleDatePicker: () => void;
  onDateChange: (event: DateTimePickerEvent, next?: Date) => void;
};

export function VisitDateRow({
  visitedAt,
  isDatePickerOpen,
  onToggleDatePicker,
  onDateChange,
}: VisitDateRowProps) {
  return (
    <>
      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={18} color={colors.accentTealDark} />
        <Text selectable style={styles.infoLabel}>
          訪問日
        </Text>
        <Text selectable style={styles.infoValue}>
          {formatDateSlash(visitedAt)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="訪問日を編集"
          hitSlop={6}
          style={styles.editIconButton}
          onPress={onToggleDatePicker}
        >
          <Ionicons
            name={isDatePickerOpen ? 'chevron-up' : 'pencil-outline'}
            size={16}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
      {isDatePickerOpen ? (
        <View style={styles.datePickerWrap}>
          <DateTimePicker
            value={fromISODate(visitedAt)}
            mode="date"
            display="inline"
            locale="ja-JP"
            maximumDate={new Date()}
            onChange={onDateChange}
            themeVariant="light"
            accentColor={colors.accentTealDark}
          />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    width: 72,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  infoValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  editIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: colors.border,
    borderWidth: 1,
  },
  datePickerWrap: {
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 250, 238, 0.55)',
  },
});
