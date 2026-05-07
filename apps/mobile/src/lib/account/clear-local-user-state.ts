import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Wipes all AsyncStorage keys after account deletion (session, onboarding, cached notes, premium cache, etc.).
 */
export async function clearAllLocalPersistedAppData(): Promise<void> {
  await AsyncStorage.clear();
}
