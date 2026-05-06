import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { queryClient } from "../src/lib/queryClient";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: "Settings",
            headerStyle: { backgroundColor: "#F6F4F0" },
            headerTintColor: "#127A63",
          }}
        />
        <Stack.Screen
          name="new-sheet"
          options={{
            presentation: "modal",
            headerShown: true,
            title: "New reflection",
            headerStyle: { backgroundColor: "#F6F4F0" },
            headerTintColor: "#127A63",
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
