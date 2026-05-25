import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PaperCard, PrimaryButton } from '@/components';
import { formatDateSlash, fromISODate } from '@/lib';
import { colors, radius, spacing } from '@/theme';
import type { Country } from '@/types';

type StepDetailsProps = {
  selectedCountry: Country;
  nextVisitOrdinal: number;
  visitedAt: string;
  isDatePickerOpen: boolean;
  onToggleDatePicker: () => void;
  onDateChange: (event: DateTimePickerEvent, next?: Date) => void;
  cityInput: string;
  cityNames: string[];
  onChangeCityInput: (value: string) => void;
  onAddCity: () => void;
  onRemoveCity: (name: string) => void;
  onNext: () => void;
};

export function StepDetails({
  selectedCountry,
  nextVisitOrdinal,
  visitedAt,
  isDatePickerOpen,
  onToggleDatePicker,
  onDateChange,
  cityInput,
  cityNames,
  onChangeCityInput,
  onAddCity,
  onRemoveCity,
  onNext,
}: StepDetailsProps) {
  return (
    <View style={styles.block}>
      <PaperCard inset style={styles.selectedCountry}>
        <Text style={styles.largeFlag}>{selectedCountry.flag}</Text>
        <View style={styles.countryNameBlock}>
          <Text selectable style={styles.selectedCountryName}>
            {selectedCountry.nameJa}
          </Text>
          <Text selectable style={styles.selectedCountryMeta}>
            次は {nextVisitOrdinal}回目の訪問として保存されます
          </Text>
        </View>
      </PaperCard>
      <View style={styles.field}>
        <Text selectable style={styles.fieldLabel}>
          訪問日
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`訪問日 ${formatDateSlash(visitedAt)}  タップで編集`}
          style={styles.dateRow}
          onPress={onToggleDatePicker}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.accentTealDark} />
          <Text selectable style={styles.dateValue}>
            {formatDateSlash(visitedAt)}
          </Text>
          <Ionicons
            name={isDatePickerOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.textMuted}
          />
        </Pressable>
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
      </View>
      <View style={styles.field}>
        <Text selectable style={styles.fieldLabel}>
          訪問した都市（複数可）
        </Text>
        <View style={styles.cityInputRow}>
          <TextInput
            value={cityInput}
            onChangeText={onChangeCityInput}
            placeholder="バンコク"
            style={[styles.input, styles.cityInput]}
            onSubmitEditing={onAddCity}
          />
          <Pressable accessibilityRole="button" style={styles.addCityButton} onPress={onAddCity}>
            <Ionicons name="add" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
        <View style={styles.chipWrap}>
          {cityNames.map((city) => (
            <Pressable key={city} style={styles.chip} onPress={() => onRemoveCity(city)}>
              <Text selectable style={styles.chipText}>
                {city} ×
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <PrimaryButton label="次へ" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.md,
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  largeFlag: {
    fontSize: 44,
  },
  countryNameBlock: {
    flex: 1,
    gap: 4,
  },
  selectedCountryName: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  selectedCountryMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 250, 238, 0.92)',
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: 15,
  },
  dateRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 250, 238, 0.92)',
    paddingHorizontal: spacing.md,
  },
  dateValue: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  datePickerWrap: {
    marginHorizontal: -spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 250, 238, 0.55)',
  },
  cityInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cityInput: {
    flex: 1,
  },
  addCityButton: {
    width: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.backgroundSoft,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
});
