import { Stack } from "expo-router";

import { emerald, stone } from "../../src/theme";

const headerSurface = stone;

export default function QuranSubgroupLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: headerSurface },
        headerTintColor: emerald,
      }}
    >
      <Stack.Screen name="settings" options={{ title: "Quran settings", headerShown: true }} />
      <Stack.Screen name="[surah]" options={{ title: "Reader", headerShown: true }} />
    </Stack>
  );
}
