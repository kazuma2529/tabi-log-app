import { AppScreen, VisitedCountriesList } from '@/components';

export default function DiaryScreen() {
  return (
    <AppScreen title="記録" variant="diary" headerAlign="center">
      <VisitedCountriesList />
    </AppScreen>
  );
}
