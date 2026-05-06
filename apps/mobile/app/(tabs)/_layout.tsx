import { Tabs } from "expo-router";

const stone = "#F6F4F0";
const emerald = "#127A63";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: emerald,
        tabBarInactiveTintColor: "#7A756C",
        tabBarStyle: {
          backgroundColor: stone,
          borderTopColor: "rgba(0,0,0,0.06)",
        },
      }}
    >
      <Tabs.Screen name="reflect" options={{ title: "Reflect" }} />
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="new" options={{ title: "New" }} />
      <Tabs.Screen name="quran" options={{ title: "Quran" }} />
      <Tabs.Screen name="prayer" options={{ title: "Prayer" }} />
    </Tabs>
  );
}
