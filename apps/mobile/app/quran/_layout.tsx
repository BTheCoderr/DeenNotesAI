import { Stack } from "expo-router";

import { AppBackHeaderButton } from "../../src/components/stack/AppBackHeaderButton";
import { emerald, stone } from "../../src/theme";

const headerSurface = stone;
const QuranHub = "/(tabs)/quran" as const;

export default function QuranSubgroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: headerSurface },
        headerTintColor: emerald,
        headerShown: true,
        headerLeft: () => <AppBackHeaderButton fallback={QuranHub} />,
      }}
    >
      <Stack.Screen name="settings" options={{ title: "Quran Preferences" }} />
      <Stack.Screen name="reading" options={{ title: "Reading modes" }} />
      <Stack.Screen name="[surah]" options={{ title: "Reader" }} />
    </Stack>
  );
}
