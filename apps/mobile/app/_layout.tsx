import { Fraunces_600SemiBold, Fraunces_700Bold, useFonts } from "@expo-google-fonts/fraunces";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";

import { OfflineRibbon } from "../src/components/OfflineRibbon";
import { CloseModalHeaderButton } from "../src/components/stack/CloseModalHeaderButton";
import { ComposeBackHeaderButton } from "../src/components/stack/ComposeBackHeaderButton";
import { MobileMonitoringBootstrap } from "../src/components/MobileMonitoringBootstrap";
import { PrayerEngineEffects } from "../src/components/PrayerEngineEffects";
import { WidgetSnapshotEffects } from "../src/components/WidgetSnapshotEffects";
import { NetworkStatusProvider } from "../src/context/NetworkStatusContext";
import { QuranPlaybackProvider } from "../src/context/QuranPlaybackContext";
import { queryClient } from "../src/lib/queryClient";
import { useNotificationPresentationHandler } from "../src/lib/notifications/handler";
import { emerald, stone } from "../src/theme";

const headerSurface = stone;

function NotificationBootstrap() {
  useNotificationPresentationHandler();
  return null;
}

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <NetworkStatusProvider>
        <NotificationBootstrap />
        <MobileMonitoringBootstrap />
        <PrayerEngineEffects />
        <WidgetSnapshotEffects />
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          <OfflineRibbon />
          <View style={{ flex: 1 }}>
            <QuranPlaybackProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="internal" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="settings"
                  options={{
                    headerShown: false,
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
                    headerLeft: () => <CloseModalHeaderButton fallback="/(tabs)" />,
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    headerShown: true,
                    title: "Sign in",
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
                    headerLeft: () => <ComposeBackHeaderButton fallback="/new-sheet" />,
                  }}
                />
                <Stack.Screen
                  name="recording/session"
                  options={{
                    headerShown: true,
                    title: "Khutbah",
                    headerStyle: { backgroundColor: headerSurface },
                    headerTintColor: emerald,
                  }}
                />
                <Stack.Screen
                  name="recordings/index"
                  options={{
                    headerShown: true,
                    title: "Recordings",
                    headerStyle: { backgroundColor: headerSurface },
                    headerTintColor: emerald,
                  }}
                />
                <Stack.Screen
                  name="recordings/[id]"
                  options={{
                    headerShown: true,
                    title: "Recording",
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
                <Stack.Screen name="quran" options={{ headerShown: false }} />
              </Stack>
            </QuranPlaybackProvider>
          </View>
        </View>
      </NetworkStatusProvider>
    </QueryClientProvider>
  );
}
