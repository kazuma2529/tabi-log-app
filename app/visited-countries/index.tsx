import { useRouter } from 'expo-router';

import { AppScreen, BackIconButton, VisitedCountriesList } from '@/components';

export default function VisitedCountriesScreen() {
  const router = useRouter();

  return (
    <AppScreen
      title="旅した国"
      headerAlign="center"
      left={<BackIconButton onPress={() => router.back()} />}
    >
      <VisitedCountriesList />
    </AppScreen>
  );
}
