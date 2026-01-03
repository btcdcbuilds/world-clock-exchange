import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  loadTimezones,
  saveTimezones,
  loadSettings,
} from "@/lib/storage";
import { fetchExchangeRates } from "@/lib/api";
import type { Timezone, AppSettings } from "@/lib/types";
import { formatTime, formatDate, getTimezoneAbbreviation } from "@/lib/time-utils";

interface TimezoneItem extends Timezone {
  currentTime: string;
  currentDate: string;
  exchangeRate: number | null;
}

export default function HomeScreen() {
  const colors = useColors();
  const [timezones, setTimezones] = useState<TimezoneItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    theme: "auto",
    timeFormat: "12h",
    dateFormat: "MM/DD/YYYY",
    baseCurrency: "USD",
  });

  const updateTimes = useCallback(async () => {
    try {
      const savedTimezones = await loadTimezones();
      const savedSettings = await loadSettings();
      setSettings(savedSettings);

      if (savedTimezones.length === 0) {
        setTimezones([]);
        return;
      }

      // Fetch exchange rates
      const rates = await fetchExchangeRates();

      // Update each timezone with current time
      const updated = savedTimezones.map((tz) => {
        // Get current time in the timezone
        const now = new Date();
        const timeString = now.toLocaleString("en-US", {
          timeZone: tz.timezone,
          hour12: savedSettings.timeFormat === "12h",
          hour: "2-digit",
          minute: "2-digit",
        });

        const dateString = now.toLocaleString("en-US", {
          timeZone: tz.timezone,
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });

        // Format according to user preferences
        let formattedDate = dateString;
        if (savedSettings.dateFormat === "DD/MM/YYYY") {
          const [month, day, year] = dateString.split("/");
          formattedDate = `${day}/${month}/${year}`;
        } else if (savedSettings.dateFormat === "YYYY-MM-DD") {
          const [month, day, year] = dateString.split("/");
          formattedDate = `${year}-${month}-${day}`;
        }

        const exchangeRate = (rates as any)[tz.currency] || null;

        return {
          ...tz,
          currentTime: timeString,
          currentDate: formattedDate,
          exchangeRate,
        };
      });

      setTimezones(updated);
    } catch (error) {
      console.error("Error updating times:", error);
    }
  }, []);

  useEffect(() => {
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [updateTimes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await updateTimes();
    setRefreshing(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Timezone",
      "Are you sure you want to remove this timezone?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = timezones.filter((tz) => tz.id !== id);
            await saveTimezones(updated);
            setTimezones(updated);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: TimezoneItem }) => (
    <Pressable
      onLongPress={() => handleDelete(item.id)}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 12,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: City and Country */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {item.city}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
              marginTop: 2,
            }}
          >
            {item.country} • {getTimezoneAbbreviation(item.timezone)}
          </Text>
        </View>

        {/* Center: Time and Date */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            {item.currentTime}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: colors.muted,
              marginTop: 2,
            }}
          >
            {item.currentDate}
          </Text>
        </View>

        {/* Right: Exchange Rate */}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          {item.exchangeRate ? (
            <>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                {item.exchangeRate.toFixed(2)} {item.currency}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  marginTop: 2,
                }}
              >
                = 1 USD
              </Text>
            </>
          ) : (
            <Text
              style={{
                fontSize: 11,
                color: colors.muted,
              }}
            >
              No rate
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.foreground,
            }}
          >
            World Clock
          </Text>
          {timezones.length > 0 && (
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 4,
              }}
            >
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Timezone List */}
        {timezones.length === 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="time-outline"
              size={64}
              color={colors.muted}
            />
            <Text
              style={{
                fontSize: 16,
                color: colors.muted,
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No timezones added yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Tap the + button to add a timezone
            </Text>
          </View>
        ) : (
          <FlatList
            data={timezones}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Add Button */}
        <Pressable
          onPress={() => router.push("/add-timezone")}
          style={({ pressed }) => [
            {
              position: "absolute",
              bottom: 24,
              right: 24,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
