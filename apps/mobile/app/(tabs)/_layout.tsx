import { Tabs } from "expo-router";

import { PRIMARY_TAB_ORDER } from "../../src/contracts/nav";

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
      {PRIMARY_TAB_ORDER.map((tab) => (
        <Tabs.Screen
          key={tab.id}
          name={tab.name}
          options={{ title: tab.title, tabBarAccessibilityLabel: tab.a11yLabel }}
        />
      ))}
    </Tabs>
  );
}
