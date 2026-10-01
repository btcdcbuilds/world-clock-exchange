import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import * as Updates from "expo-updates";
import Constants from "expo-constants";

import { useColors } from "@/hooks/use-colors";

function formatWhen(date: Date): string {
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Settings card: shows which version is running and lets the user check for, download and
 * switch to a newer one without reinstalling the app.
 */
export function AppUpdatesCard() {
  const colors = useColors();
  const { currentlyRunning, isChecking, isDownloading, isUpdatePending } = Updates.useUpdates();
  const [message, setMessage] = useState<string | null>(null);
  const busy = isChecking || isDownloading;

  const installed = currentlyRunning.isEmbeddedLaunch
    ? "As installed"
    : currentlyRunning.createdAt
      ? `Updated ${formatWhen(currentlyRunning.createdAt)}`
      : "Updated";

  const checkNow = async () => {
    if (!Updates.isEnabled) {
      setMessage("Updates work in the installed app, not in a development preview.");
      return;
    }
    setMessage(null);
    try {
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        setMessage("You have the latest version.");
        return;
      }
      await Updates.fetchUpdateAsync();
    } catch {
      setMessage("Couldn't check for updates. Check the internet connection and try again.");
    }
  };

  const label = isUpdatePending
    ? "Restart to update"
    : isDownloading
      ? "Downloading update…"
      : isChecking
        ? "Checking…"
        : "Check for updates";

  return (
    <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
      <Text className="text-sm font-semibold text-muted mb-3">APP UPDATES</Text>
      <View className="flex-row justify-between mb-1">
        <Text className="text-base text-foreground">Version</Text>
        <Text className="text-base text-muted">{Constants.expoConfig?.version ?? "—"}</Text>
      </View>
      <View className="flex-row justify-between mb-3">
        <Text className="text-base text-foreground mr-4">This copy</Text>
        <Text className="text-base text-muted text-right flex-shrink">{installed}</Text>
      </View>
      <TouchableOpacity
        onPress={isUpdatePending ? () => Updates.reloadAsync() : checkNow}
        disabled={busy}
        activeOpacity={0.8}
        accessibilityLabel={label}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 12,
          borderRadius: 12,
          backgroundColor: isUpdatePending ? colors.primary : colors.background,
          borderWidth: isUpdatePending ? 0 : 1,
          borderColor: colors.border,
          opacity: busy ? 0.7 : 1,
        }}
      >
        {busy && <ActivityIndicator size="small" color={colors.primary} />}
        <Text style={{ fontSize: 15, fontWeight: "700", color: isUpdatePending ? "#FFFFFF" : colors.foreground }}>
          {label}
        </Text>
      </TouchableOpacity>
      {isUpdatePending ? (
        <Text className="text-sm text-muted mt-2 text-center">A new version has downloaded.</Text>
      ) : message ? (
        <Text className="text-sm text-muted mt-2 text-center">{message}</Text>
      ) : (
        <Text className="text-xs text-muted mt-2 text-center">
          The app also checks by itself every time it opens.
        </Text>
      )}
    </View>
  );
}

/**
 * Asks once to restart when a newer version has finished downloading in the background
 * (the app checks every time it opens).
 */
export function UpdateReadyPrompt() {
  const { isUpdatePending } = Updates.useUpdates();
  const asked = useRef(false);

  useEffect(() => {
    if (!isUpdatePending || asked.current) return;
    asked.current = true;
    Alert.alert("Update ready", "A new version of TimeZone Exchange has downloaded.", [
      { text: "Later", style: "cancel" },
      { text: "Restart now", onPress: () => Updates.reloadAsync() },
    ]);
  }, [isUpdatePending]);

  return null;
}
