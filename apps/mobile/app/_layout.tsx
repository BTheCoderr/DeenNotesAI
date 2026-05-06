import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { queryClient } from "../src/lib/queryClient";
import { emerald, stone } from "../src/theme";

const headerSurface = stone;

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: "Settings",
            headerStyle: { backgroundColor: headerSurface },
            headerTintColor: emerald,
          }}
        />
        <Stack.Screen
          name="new-sheet"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "New reflection",
            headerStyle: { backgroundColor: headerSurface },
            headerTintColor: emerald,
          }}
        />
        <Stack.Screen
          name="compose/[mode]"
          options={{
            headerShown: true,
            title: "Compose",
            headerStyle: { backgroundColor: headerSurface },
            headerTintColor: emerald,
          }}
        />
        <Stack.Screen
          name="notes/[id]"
          options={{
            headerShown: true,
            title: "Reflection",
            headerStyle: { backgroundColor: headerSurface },
            headerTintColor: emerald,
          }}
        />
        <Stack.Screen
          name="quran/[surah]"
          options={{
            headerShown: true,
            title: "Reader",
            headerStyle: { backgroundColor: headerSurface },
            headerTintColor: emerald,
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
