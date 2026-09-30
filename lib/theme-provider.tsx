import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";
import { loadSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/types";

/** The user's choice in Settings: follow the phone ("auto") or force light/dark. */
export type ThemePreference = AppSettings["theme"];

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>("auto");
  const colorScheme: ColorScheme = themePreference === "auto" ? systemScheme : themePreference;

  // Honour the preference saved in Settings from the first launch onward.
  useEffect(() => {
    loadSettings()
      .then((saved) => {
        if (saved?.theme) setThemePreferenceState(saved.theme);
      })
      .catch(() => {});
  }, []);

  // Light/Dark override the phone's setting; Auto ("system") hands control back to it.
  // On native, NativeWind's colorScheme.set() calls Appearance.setColorScheme(), which pins
  // the app to that scheme. So it is driven by the preference only, never by the resolved
  // scheme: pinning the resolved scheme in Auto froze the app on it (it stopped following
  // the phone), and racing the Auto call could flip light/dark back and forth endlessly.
  useEffect(() => {
    if (typeof document === "undefined") {
      nativewindColorScheme.set(themePreference === "auto" ? "system" : themePreference);
    }
  }, [themePreference]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      // Web: NativeWind only toggles the "dark" class here, so it gets the resolved scheme.
      nativewindColorScheme.set(colorScheme);
      const root = document.documentElement;
      root.dataset.theme = colorScheme;
      root.classList.toggle("dark", colorScheme === "dark");
      const palette = SchemeColors[colorScheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, [colorScheme]);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
  }, []);

  // Kept for existing callers (the developer theme lab): forcing a scheme is an explicit preference.
  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setThemePreferenceState(scheme);
  }, []);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": SchemeColors[colorScheme].primary,
        "color-background": SchemeColors[colorScheme].background,
        "color-surface": SchemeColors[colorScheme].surface,
        "color-foreground": SchemeColors[colorScheme].foreground,
        "color-muted": SchemeColors[colorScheme].muted,
        "color-border": SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
      themePreference,
      setThemePreference,
    }),
    [colorScheme, setColorScheme, themePreference, setThemePreference],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
