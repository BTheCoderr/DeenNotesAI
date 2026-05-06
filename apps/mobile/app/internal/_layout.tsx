import { Redirect, Stack } from "expo-router";

import { AppBackHeaderButton } from "../../src/components/stack/AppBackHeaderButton";
import { emerald, stone } from "../../src/theme";

export default function InternalLayoutRoute() {
  if (!__DEV__) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: stone },
        headerTintColor: emerald,
        headerLeft: () => <AppBackHeaderButton fallback="/(tabs)" accessibilityLabel="Close internal tools" />,
      }}
    >
      <Stack.Screen name="qa" options={{ title: "M7 QA checklist" }} />
      <Stack.Screen name="subscription-qa" options={{ title: "M9 Subscription QA" }} />
      <Stack.Screen name="navigation-audit" options={{ title: "Navigation audit" }} />
    </Stack>
  );
}
