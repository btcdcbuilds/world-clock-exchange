import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  TextInput,
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
  getUTCOffset,
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
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState<Timezone | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [convertedTimes, setConvertedTimes] = useState<ConvertedTime[]>([]);
  const [meetingTitle, setMeetingTitle] = useState("");
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

    const converted: ConvertedTime[] = timezones.map((tz) => {
      return {
        timezone: tz,
        localTime: selectedDate,
        formattedTime: formatTime(selectedDate, settings.timeFormat, tz.timezone),
        formattedDate: formatDate(selectedDate, settings.dateFormat, tz.timezone),
        exchangeRate: null,
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
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 0.5,
          borderRadius: 12,
          padding: 12,
          marginBottom: 8,
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
            {item.timezone.city}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.muted,
              marginTop: 2,
            }}
          >
            {item.timezone.country}
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
            {item.formattedTime}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: colors.muted,
              marginTop: 2,
            }}
          >
            {item.formattedDate}
          </Text>
        </View>

        {/* Right: Timezone Info */}
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            {getTimezoneAbbreviation(item.timezone.timezone)}
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: colors.muted,
              marginTop: 2,
            }}
          >
            {getUTCOffset(item.timezone.timezone)}
          </Text>
        </View>
      </View>
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
            onPress={() => setShowTimezonePicker(true)}
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

        {/* Meeting Title */}
        <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
          <Text className="text-sm font-semibold text-muted mb-2">
            MEETING TITLE (OPTIONAL)
          </Text>
          <TextInput
            value={meetingTitle}
            onChangeText={setMeetingTitle}
            placeholder="e.g., Team Standup, Client Call"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.background,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 15,
              color: colors.foreground,
            }}
          />
        </View>

        {/* Converted Times */}
        <View ref={exportViewRef} collapsable={false}>
        {/* Meeting Header for Export */}
        {meetingTitle && (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: colors.foreground,
                marginBottom: 8,
              }}
            >
              {meetingTitle}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.muted,
              }}
            >
              {selectedTimezone?.city} • {formatDate(selectedDate, settings.dateFormat)} at {formatTime(selectedDate, settings.timeFormat)}
            </Text>
          </View>
        )}
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

      {/* Timezone Picker Modal */}
      <Modal
        visible={showTimezonePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimezonePicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "70%",
              paddingTop: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingBottom: 15,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                Select Source Timezone
              </Text>
              <TouchableOpacity onPress={() => setShowTimezonePicker(false)}>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.primary,
                    fontWeight: "600",
                  }}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={timezones}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTimezone(item);
                    setShowTimezonePicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor:
                      selectedTimezone?.id === item.id
                        ? colors.surface
                        : colors.background,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    {item.city}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.muted,
                      marginTop: 2,
                    }}
                  >
                    {item.country} • {getTimezoneAbbreviation(item.timezone)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
