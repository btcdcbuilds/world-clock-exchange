import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  loadTimezones,
  saveTimezones,
  loadSettings,
  cacheExchangeRates,
  loadCachedExchangeRates,
} from "@/lib/storage";
import { fetchExchangeRates } from "@/lib/api";
import type { Timezone, AppSettings } from "@/lib/types";
import { formatTime, formatDate, getTimezoneAbbreviation } from "@/lib/time-utils";

interface TimezoneItem extends Timezone {
  currentTime: string;
  currentDate: string;
  exchangeRate: number | null;
}

/**
 * Two decimals for rates of 1 or more; three significant digits below that,
 * so small rates (e.g. against the yen: 0.00481 GBP) don't round to 0.00.
 */
function formatExchangeRate(rate: number): string {
  if (rate >= 1) return rate.toFixed(2);
  const decimals = Math.min(8, 2 - Math.floor(Math.log10(rate)));
  return rate.toFixed(decimals);
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
  // Rates are kept together with the base they are quoted against, so a set for
  // another base is never shown under the current base's label.
  const ratesRef = useRef<{ base: string; rates: Record<string, number> }>({ base: "", rates: {} });
  const rateRequestRef = useRef(0);
  const savedTimezonesRef = useRef<Timezone[]>([]);

  // Load saved cities and settings (fast, local)
  const loadLocal = useCallback(async () => {
    const [savedTimezones, savedSettings] = await Promise.all([
      loadTimezones(),
      loadSettings(),
    ]);
    savedTimezonesRef.current = savedTimezones;
    setSettings(savedSettings);
  }, []);

  // Exchange rates come from the network; a failure must never hide the clocks.
  // Rates are quoted against the base currency chosen in Settings, and a cached
  // set is only reused when it was fetched for that same base.
  // Only the latest request may set the rates: the first request goes out with the
  // default base before saved settings load, and it must not land after (and
  // overwrite) the request for the saved base.
  const loadRates = useCallback(async (base: string) => {
    const request = ++rateRequestRef.current;
    try {
      const rates = await fetchExchangeRates(base);
      if (request !== rateRequestRef.current) return;
      ratesRef.current = { base, rates: rates || {} };
      await cacheExchangeRates({ base, date: new Date().toISOString(), rates });
    } catch {
      const cached = await loadCachedExchangeRates();
      if (request !== rateRequestRef.current) return;
      ratesRef.current = {
        base,
        rates: cached?.rates && cached.base === base ? cached.rates : {},
      };
    }
  }, []);

  // Lightweight tick that only formats the current time (no async calls)
  const tick = useCallback(() => {
    const saved = savedTimezonesRef.current;
    if (saved.length === 0) {
      setTimezones([]);
      return;
    }

    const now = new Date();
    const currentSettings = settings;
    // Rates for another base (still loading after a base change) are not shown.
    const rates: Record<string, number> =
      ratesRef.current.base === currentSettings.baseCurrency ? ratesRef.current.rates : {};

    const updated = saved.map((tz) => ({
      ...tz,
      currentTime: formatTime(now, currentSettings.timeFormat, tz.timezone),
      currentDate: formatDate(now, currentSettings.dateFormat, tz.timezone),
      // The rate feed never lists the base currency against itself, so a city
      // that uses the base currency is exactly 1, not "No rate".
      exchangeRate:
        tz.currency === currentSettings.baseCurrency ? 1 : rates[tz.currency] || null,
    }));

    setTimezones(updated);
  }, [settings]);

  // Reload cities whenever this tab comes into focus (e.g. after adding one)
  useFocusEffect(
    useCallback(() => {
      // Setting settings re-creates `tick`, whose effect below redraws immediately
      loadLocal();
    }, [loadLocal])
  );

  // (Re)load rates whenever the base currency changes in Settings.
  useEffect(() => {
    loadRates(settings.baseCurrency).then(() => tick());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRates, settings.baseCurrency]);

  // Tick every second for live clock updates (no async overhead)
  useEffect(() => {
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadLocal(), loadRates(settings.baseCurrency)]);
    tick();
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
            const updated = savedTimezonesRef.current.filter((tz) => tz.id !== id);
            savedTimezonesRef.current = updated;
            await saveTimezones(updated);
            tick();
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
                {formatExchangeRate(item.exchangeRate)} {item.currency}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  marginTop: 2,
                }}
              >
                = 1 {settings.baseCurrency}
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
              Long-press a city to remove it
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
