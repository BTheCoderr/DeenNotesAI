import { Redirect, Stack } from "expo-router";

import { emerald, stone } from "../../src/theme";

export default function InternalLayoutRoute() {
  if (!__DEV__) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: stone },
        headerTintColor: emerald,
      }}
    >
      <Stack.Screen name="qa" options={{ title: "M7 QA checklist" }} />
    </Stack>
  );
}
