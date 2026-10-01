import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  // Always add the gap on top of the bottom inset, never Math.max(inset, gap).
  // In Expo Go on Android the app starts drawn above the gesture bar (bottom inset 0);
  // the first light/dark change (Appearance.setColorScheme) re-applies edge-to-edge,
  // so the app then runs under the gesture bar with a 24 dp bottom inset instead.
  // "inset + gap" puts the icons and labels at the same place on screen in both states;
  // Math.max(inset, 8) moved the whole bar about 8 dp down after the first theme change.
  const bottomPadding = Platform.OS === "web" ? 12 : insets.bottom + 8;
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "World Clock",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="meeting"
        options={{
          title: "Meeting",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
