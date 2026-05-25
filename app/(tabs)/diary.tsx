import { AppScreen, VisitedCountriesList } from '@/components';

export default function DiaryScreen() {
  return (
    <AppScreen title="記録" variant="diary" backgroundImage={require('../../assets/images/diary-travel-background.png')} headerAlign="center">
      <VisitedCountriesList />
    </AppScreen>
  );
}
