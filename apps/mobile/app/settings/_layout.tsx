import { Stack } from "expo-router";

import { emerald, stone } from "../../src/theme";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: stone },
        headerTintColor: emerald,
        headerTitleStyle: { color: emerald, fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="prayer" options={{ title: "Prayer & reminders" }} />
      <Stack.Screen name="location" options={{ title: "Location" }} />
      <Stack.Screen name="hijri" options={{ title: "Hijri & Ramadan" }} />
      <Stack.Screen name="quran" options={{ title: "Quran preferences" }} />
      <Stack.Screen name="offline" options={{ title: "Offline Quran" }} />
      <Stack.Screen name="recordings" options={{ title: "Recordings" }} />
      <Stack.Screen name="continuity-preferences" options={{ title: "Reflection preferences" }} />
      <Stack.Screen name="widget-preferences" options={{ title: "Home widgets" }} />
      <Stack.Screen name="folders" options={{ title: "Folders" }} />
      <Stack.Screen name="privacy" options={{ title: "Privacy" }} />
      <Stack.Screen name="terms" options={{ title: "Terms" }} />
      <Stack.Screen name="about" options={{ title: "About" }} />
      <Stack.Screen name="faq" options={{ title: "FAQ" }} />
      <Stack.Screen name="feedback" options={{ title: "Feedback" }} />
      <Stack.Screen name="invite" options={{ title: "Invite" }} />
    </Stack>
  );
}
