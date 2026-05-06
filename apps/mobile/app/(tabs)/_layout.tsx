import type { ComponentProps } from "react";

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { PRIMARY_TAB_ORDER, type MobileTabId } from "../../src/contracts/nav";
import { emerald, stone, stoneMuted } from "../../src/theme";

const TAB_ICONS: Record<
  MobileTabId,
  ComponentProps<typeof Ionicons>["name"]
> = {
  reflect: "reader-outline",
  today: "heart-outline",
  new: "add-circle",
  quran: "book-outline",
  prayer: "time-outline",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: emerald,
        tabBarInactiveTintColor: stoneMuted,
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
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.a11yLabel,
            tabBarShowLabel: true,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={TAB_ICONS[tab.id]}
                size={tab.id === "new" ? size + 4 : size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
