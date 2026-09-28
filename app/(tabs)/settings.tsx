import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { loadSettings, saveSettings } from "@/lib/storage";
import { useThemeContext } from "@/lib/theme-provider";
import type { AppSettings } from "@/lib/types";

export default function SettingsScreen() {
  const colors = useColors();
  const { setThemePreference } = useThemeContext();
  const [settings, setSettings] = useState<AppSettings>({
    baseCurrency: "USD",
    timeFormat: "12h",
    dateFormat: "MM/DD/YYYY",
    theme: "auto",
  });

  useEffect(() => {
    loadInitialSettings();
  }, []);

  const loadInitialSettings = async () => {
    const savedSettings = await loadSettings();
    setSettings(savedSettings);
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    // Theme applies app-wide immediately, not just on the next launch.
    if (key === "theme") setThemePreference(value as AppSettings["theme"]);
    await saveSettings(newSettings);
  };

  const renderOption = (
    label: string,
    value: string,
    options: { label: string; value: string }[],
    onSelect: (value: string) => void
  ) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-muted mb-2">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
            className={`px-4 py-2 rounded-full border ${
              value === option.value
                ? "bg-primary border-primary"
                : "bg-surface border-border"
            }`}
          >
            <Text
              className={`font-medium ${
                value === option.value ? "text-background" : "text-foreground"
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-3xl font-bold text-foreground mb-6">Settings</Text>

        {/* Base Currency */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          {renderOption(
            "BASE CURRENCY",
            settings.baseCurrency,
            [
              { label: "USD", value: "USD" },
              { label: "EUR", value: "EUR" },
              { label: "GBP", value: "GBP" },
              { label: "JPY", value: "JPY" },
              { label: "CNY", value: "CNY" },
              { label: "HKD", value: "HKD" },
            ],
            (value) => updateSetting("baseCurrency", value)
          )}
        </View>

        {/* Time Format */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          {renderOption(
            "TIME FORMAT",
            settings.timeFormat,
            [
              { label: "12 Hour", value: "12h" },
              { label: "24 Hour", value: "24h" },
            ],
            (value) => updateSetting("timeFormat", value as "12h" | "24h")
          )}
        </View>

        {/* Date Format */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          {renderOption(
            "DATE FORMAT",
            settings.dateFormat,
            [
              { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
              { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
              { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
            ],
            (value) =>
              updateSetting(
                "dateFormat",
                value as "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
              )
          )}
        </View>

        {/* Theme */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          {renderOption(
            "THEME",
            settings.theme,
            [
              { label: "Auto", value: "auto" },
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ],
            (value) => updateSetting("theme", value as "light" | "dark" | "auto")
          )}
        </View>

        {/* About */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <Text className="text-sm font-semibold text-muted mb-3">ABOUT</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-base text-foreground">Version</Text>
              <Text className="text-base text-muted">{Constants.expoConfig?.version ?? "—"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-base text-foreground">Exchange Rate API</Text>
              <Text className="text-base text-muted">Frankfurter</Text>
            </View>
          </View>
        </View>

        <View className="pb-8">
          <Text className="text-xs text-muted text-center">
            Exchange rates provided by Frankfurter API
          </Text>
          <Text className="text-xs text-muted text-center mt-1">
            Data sourced from European Central Bank
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
