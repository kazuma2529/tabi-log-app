import Storage from 'expo-sqlite/kv-store';

const ONBOARDING_COMPLETED_KEY = 'onboarding.completed.v1';

export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    const value = await Storage.getItem(ONBOARDING_COMPLETED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function markOnboardingCompleted(): Promise<void> {
  await Storage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
}

export async function resetOnboardingCompletedForDev(): Promise<void> {
  await Storage.removeItem(ONBOARDING_COMPLETED_KEY);
}
