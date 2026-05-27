import { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { StyleSheet, View } from 'react-native';

import { PaperCard } from '@/components';
import { colors, spacing } from '@/theme';
import type { City } from '@/types';

import { VisitCitiesRow } from './visit-cities-row';
import { VisitDateRow } from './visit-date-row';

type VisitInfoCardProps = {
  visitedAt: string;
  cities: City[];
  isDatePickerOpen: boolean;
  onToggleDatePicker: () => void;
  onDateChange: (event: DateTimePickerEvent, next?: Date) => void;
  isCityEditing: boolean;
  isCityInputOpen: boolean;
  cityDraft: string;
  onChangeCityDraft: (value: string) => void;
  onToggleCityEditing: () => void;
  onOpenCityInput: () => void;
  onAddCity: () => void;
  onSubmitCity: () => void;
  onRemoveCity: (city: City) => void;
};

export function VisitInfoCard({
  visitedAt,
  cities,
  isDatePickerOpen,
  onToggleDatePicker,
  onDateChange,
  isCityEditing,
  isCityInputOpen,
  cityDraft,
  onChangeCityDraft,
  onToggleCityEditing,
  onOpenCityInput,
  onAddCity,
  onSubmitCity,
  onRemoveCity,
}: VisitInfoCardProps) {
  return (
    <PaperCard inset style={styles.card}>
      <VisitDateRow
        visitedAt={visitedAt}
        isDatePickerOpen={isDatePickerOpen}
        onToggleDatePicker={onToggleDatePicker}
        onDateChange={onDateChange}
      />

      <View style={styles.divider} />

      <VisitCitiesRow
        cities={cities}
        isCityEditing={isCityEditing}
        isCityInputOpen={isCityInputOpen}
        cityDraft={cityDraft}
        onChangeCityDraft={onChangeCityDraft}
        onToggleCityEditing={onToggleCityEditing}
        onOpenCityInput={onOpenCityInput}
        onAddCity={onAddCity}
        onSubmitCity={onSubmitCity}
        onRemoveCity={onRemoveCity}
      />
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.6,
  },
});
