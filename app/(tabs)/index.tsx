import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import type { Timezone, TimezoneWithTime, ExchangeRates } from "@/lib/types";
import {
  loadTimezones,
  saveTimezones,
  loadSettings,
  loadCachedExchangeRates,
  cacheExchangeRates,
} from "@/lib/storage";
import { fetchExchangeRates } from "@/lib/api";
import { enrichTimezoneWithTime, getTimezoneAbbreviation } from "@/lib/time-utils";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [timezones, setTimezones] = useState<TimezoneWithTime[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [settings, setSettings] = useState<{
    baseCurrency: string;
    timeFormat: "12h" | "24h";
    dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
    theme: "light" | "dark" | "auto";
  }>({
    baseCurrency: "USD",
    timeFormat: "12h",
    dateFormat: "MM/DD/YYYY",
    theme: "auto",
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimezones();
    }, 1000);

    return () => clearInterval(interval);
  }, [timezones, exchangeRates, settings]);

  const loadInitialData = async () => {
    try {
      const [savedTimezones, savedSettings, cachedRates] = await Promise.all([
        loadTimezones(),
        loadSettings(),
        loadCachedExchangeRates(),
      ]);

      setSettings(savedSettings);

      // If no cached rates, fetch fresh ones
      let rates = cachedRates;
      if (!rates) {
        rates = await fetchExchangeRates(savedSettings.baseCurrency);
        await cacheExchangeRates(rates);
      }
      setExchangeRates(rates);

      // Enrich timezones with time and exchange rate data
      const enrichedTimezones = savedTimezones.map((tz) =>
        enrichTimezoneWithTime(
          tz,
          savedSettings,
          rates?.rates[tz.currency] || null
        )
      );

      setTimezones(enrichedTimezones);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateTimezones = async () => {
    const savedTimezones = await loadTimezones();
    const enrichedTimezones = savedTimezones.map((tz) =>
      enrichTimezoneWithTime(
        tz,
        settings,
        exchangeRates?.rates[tz.currency] || null
      )
    );
    setTimezones(enrichedTimezones);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const rates = await fetchExchangeRates(settings.baseCurrency);
      await cacheExchangeRates(rates);
      setExchangeRates(rates);

      const savedTimezones = await loadTimezones();
      const enrichedTimezones = savedTimezones.map((tz) =>
        enrichTimezoneWithTime(tz, settings, rates.rates[tz.currency] || null)
      );
      setTimezones(enrichedTimezones);
    } catch (error) {
      console.error("Failed to refresh:", error);
      Alert.alert("Error", "Failed to refresh exchange rates.");
    } finally {
      setRefreshing(false);
    }
  }, [settings, exchangeRates]);

  const handleDeleteTimezone = async (timezoneId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const updatedTimezones = timezones.filter((tz) => tz.id !== timezoneId);
    setTimezones(updatedTimezones);

    const plainTimezones: Timezone[] = updatedTimezones.map((tz) => ({
      id: tz.id,
      city: tz.city,
      country: tz.country,
      timezone: tz.timezone,
      currency: tz.currency,
      utcOffset: tz.utcOffset,
    }));

    await saveTimezones(plainTimezones);
  };

  const handleAddTimezone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/add-timezone");
  };

  const renderTimezoneCard = ({ item }: { item: TimezoneWithTime }) => (
    <View className="bg-surface rounded-2xl p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-xl font-semibold text-foreground">
            {item.city}
          </Text>
          <Text className="text-sm text-muted mt-0.5">
            {item.country} • {getTimezoneAbbreviation(item.timezone)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDeleteTimezone(item.id)}
          style={({ pressed }: { pressed: boolean }) => ({
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <IconSymbol name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View className="mt-4">
        <Text className="text-4xl font-bold text-foreground">
          {item.formattedTime}
        </Text>
        <Text className="text-base text-muted mt-1">{item.formattedDate}</Text>
      </View>

      {item.exchangeRate && (
        <View className="mt-3 bg-primary/10 rounded-lg px-3 py-2">
          <Text className="text-sm font-medium text-primary">
            1 {settings.baseCurrency} = {item.exchangeRate.toFixed(2)}{" "}
            {item.currency}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <IconSymbol name="clock.fill" size={64} color={colors.muted} />
      <Text className="text-2xl font-bold text-foreground mt-4">
        No Timezones Added
      </Text>
      <Text className="text-base text-muted text-center mt-2">
        Add your first timezone to start tracking time and exchange rates around
        the world
      </Text>
      <TouchableOpacity
        onPress={handleAddTimezone}
        className="bg-primary px-6 py-3 rounded-full mt-6"
        style={({ pressed }: { pressed: boolean }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text className="text-background font-semibold">Add Timezone</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold text-foreground">World Clock</Text>
        </View>

        {exchangeRates && (
          <Text className="text-xs text-muted mb-3">
            Last updated: {exchangeRates.date}
          </Text>
        )}

        <FlatList
          data={timezones}
          renderItem={renderTimezoneCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 80,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />

        {timezones.length > 0 && (
          <TouchableOpacity
            onPress={handleAddTimezone}
            className="absolute bottom-4 right-4 bg-primary w-14 h-14 rounded-full items-center justify-center"
            style={({ pressed }: { pressed: boolean }) => ({
              opacity: pressed ? 0.8 : 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            })}
          >
            <IconSymbol name="plus" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </ScreenContainer>
  );
}
