import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import type { Timezone, ExchangeRates } from "@/lib/types";
import {
  loadTimezones,
  loadSettings,
  loadCachedExchangeRates,
} from "@/lib/storage";
import {
  formatTime,
  formatDate,
  getTimezoneAbbreviation,
} from "@/lib/time-utils";

interface ConvertedTime {
  timezone: Timezone;
  localTime: Date;
  formattedTime: string;
  formattedDate: string;
  exchangeRate: number | null;
}

export default function ConverterScreen() {
  const colors = useColors();
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<Timezone | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [convertedTimes, setConvertedTimes] = useState<ConvertedTime[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [settings, setSettings] = useState({
    baseCurrency: "USD",
    timeFormat: "12h" as "12h" | "24h",
    dateFormat: "MM/DD/YYYY" as "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTimezone && timezones.length > 0) {
      convertTimes();
    }
  }, [selectedDate, selectedTimezone, timezones, exchangeRates]);

  const loadInitialData = async () => {
    const [savedTimezones, savedSettings, cachedRates] = await Promise.all([
      loadTimezones(),
      loadSettings(),
      loadCachedExchangeRates(),
    ]);

    setTimezones(savedTimezones);
    setSettings(savedSettings);
    setExchangeRates(cachedRates);

    if (savedTimezones.length > 0) {
      setSelectedTimezone(savedTimezones[0]);
    }
  };

  const convertTimes = () => {
    if (!selectedTimezone) return;

    const sourceTimeString = selectedDate.toLocaleString("en-US", {
      timeZone: selectedTimezone.timezone,
    });
    const sourceTime = new Date(sourceTimeString);

    const converted: ConvertedTime[] = timezones.map((tz) => {
      const targetTimeString = selectedDate.toLocaleString("en-US", {
        timeZone: tz.timezone,
      });
      const targetTime = new Date(targetTimeString);

      return {
        timezone: tz,
        localTime: targetTime,
        formattedTime: formatTime(targetTime, settings.timeFormat),
        formattedDate: formatDate(targetTime, settings.dateFormat),
        exchangeRate: exchangeRates?.rates[tz.currency] || null,
      };
    });

    setConvertedTimes(converted);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedDate(date);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const exportViewRef = useRef(null);

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      "Export Format",
      "Choose export format:",
      [
        {
          text: "PNG",
          onPress: async () => {
            try {
              const { captureAndShareView } = await import("@/lib/export-utils");
              await captureAndShareView(exportViewRef, "meeting-times.png");
            } catch (error) {
              console.error("Export failed:", error);
            }
          },
        },
        {
          text: "JPEG",
          onPress: async () => {
            try {
              const { captureAndShareAsJPEG } = await import("@/lib/export-utils");
              await captureAndShareAsJPEG(exportViewRef, "meeting-times.jpg");
            } catch (error) {
              console.error("Export failed:", error);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const renderConvertedTimeCard = ({ item }: { item: ConvertedTime }) => (
    <View className="bg-surface rounded-2xl p-4 mb-3 border border-border">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-xl font-semibold text-foreground">
            {item.timezone.city}
          </Text>
          <Text className="text-sm text-muted mt-0.5">
            {item.timezone.country} •{" "}
            {getTimezoneAbbreviation(item.timezone.timezone)}
          </Text>
        </View>
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
            {item.timezone.currency}
          </Text>
        </View>
      )}
    </View>
  );

  if (timezones.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <IconSymbol
          name="arrow.left.arrow.right"
          size={64}
          color={colors.muted}
        />
        <Text className="text-2xl font-bold text-foreground mt-4">
          No Timezones Added
        </Text>
        <Text className="text-base text-muted text-center mt-2">
          Add timezones from the World Clock tab to use the converter
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-3xl font-bold text-foreground mb-4">
          Time Converter
        </Text>

        {/* Source Timezone Selector */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <Text className="text-sm font-semibold text-muted mb-2">
            SOURCE TIMEZONE
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-background rounded-xl p-3 border border-border"
          >
            <Text className="text-lg font-semibold text-foreground">
              {selectedTimezone?.city || "Select timezone"}
            </Text>
            {selectedTimezone && (
              <Text className="text-sm text-muted mt-0.5">
                {selectedTimezone.country} •{" "}
                {getTimezoneAbbreviation(selectedTimezone.timezone)}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Date and Time Pickers */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <Text className="text-sm font-semibold text-muted mb-2">
            MEETING DATE & TIME
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              className="flex-1 bg-background rounded-xl p-3 border border-border"
            >
              <Text className="text-xs text-muted mb-1">Date</Text>
              <Text className="text-base font-semibold text-foreground">
                {formatDate(selectedDate, settings.dateFormat)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
              className="flex-1 bg-background rounded-xl p-3 border border-border"
            >
              <Text className="text-xs text-muted mb-1">Time</Text>
              <Text className="text-base font-semibold text-foreground">
                {formatTime(selectedDate, settings.timeFormat)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Converted Times */}
        <View ref={exportViewRef} collapsable={false}>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-foreground">
            Converted Times
          </Text>
          <TouchableOpacity
            onPress={handleExport}
            activeOpacity={0.7}
            className="bg-primary px-4 py-2 rounded-full"
          >
            <View className="flex-row items-center gap-1">
              <IconSymbol name="square.and.arrow.up" size={16} color="#FFFFFF" />
              <Text className="text-background font-semibold ml-1">Export</Text>
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={convertedTimes}
          renderItem={renderConvertedTimeCard}
          keyExtractor={(item) => item.timezone.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
