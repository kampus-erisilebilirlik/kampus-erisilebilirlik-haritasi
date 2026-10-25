import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";

import { useTheme } from "@/theme/ThemeProvider";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabs: { name: string; title: string; icon: IconName; a11y: string }[] = [
  { name: "index", title: "Harita", icon: "map", a11y: "Harita sekmesi" },
  { name: "liste", title: "Liste", icon: "list", a11y: "Liste sekmesi, tüm noktalar" },
  { name: "bilgi", title: "Bilgi", icon: "information-circle", a11y: "Bilgi ve ayarlar sekmesi" },
];

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: tab.a11y,
            tabBarIcon: ({ focused, size }) => (
              <Ionicons name={tab.icon} color={focused ? colors.primary : colors.textMuted} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
