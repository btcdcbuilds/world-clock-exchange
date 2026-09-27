import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  SectionList,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { getTimezonesByRegion, searchTimezones } from "@/lib/timezone-data";
import { addTimezone, loadTimezones } from "@/lib/storage";
import type { Timezone } from "@/lib/types";

export default function AddTimezoneScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTimezones, setFilteredTimezones] = useState<
    Omit<Timezone, "id">[]
  >([]);
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());

  const keyOf = (tz: Omit<Timezone, "id">) => `${tz.city}|${tz.timezone}`;

  useEffect(() => {
    loadTimezones().then((saved) => setAddedKeys(new Set(saved.map(keyOf))));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredTimezones([]);
    } else {
      const results = searchTimezones(query);
      setFilteredTimezones(results);
    }
  };

  const handleSelectTimezone = async (timezone: Omit<Timezone, "id">) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (addedKeys.has(keyOf(timezone))) {
      router.back();
      return;
    }

    const id = `${timezone.timezone}-${Date.now()}`;

    const newTimezone: Timezone = {
      id,
      ...timezone,
    };

    await addTimezone(newTimezone);
    router.back();
  };

  const renderTimezoneItem = ({ item }: { item: Omit<Timezone, "id"> }) => (
    <TouchableOpacity
      onPress={() => handleSelectTimezone(item)}
      className="bg-surface rounded-xl p-4 mb-2 border border-border"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground">
            {item.city}
          </Text>
          <Text className="text-sm text-muted mt-0.5">
            {item.country} • {item.utcOffset}
          </Text>
        </View>
        {addedKeys.has(keyOf(item)) ? (
          <IconSymbol name="checkmark.circle.fill" size={24} color={colors.success} />
        ) : (
          <View className="bg-primary/10 rounded-lg px-3 py-1.5">
            <Text className="text-sm font-medium text-primary">
              {item.currency}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const regionData = getTimezonesByRegion();
  const sections = Object.entries(regionData)
    .filter(([_, timezones]) => timezones.length > 0)
    .map(([region, timezones]) => ({
      title: region,
      data: timezones,
    }));

  return (
    <ScreenContainer>
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mr-3"
          >
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-3xl font-bold text-foreground">
            Add Timezone
          </Text>
        </View>

        {/* Search Bar */}
        <View className="bg-surface rounded-xl px-4 py-3 mb-4 flex-row items-center border border-border">
          <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search city or country..."
            placeholderTextColor={colors.muted}
            className="flex-1 ml-2 text-base text-foreground"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")} activeOpacity={0.7}>
              <IconSymbol name="xmark" size={20} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results */}
        {searchQuery.trim() === "" ? (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.timezone}-${index}`}
            renderItem={renderTimezoneItem}
            renderSectionHeader={({ section: { title } }) => (
              <View className="bg-background py-2">
                <Text className="text-sm font-semibold text-muted uppercase">
                  {title}
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
            stickySectionHeadersEnabled={false}
          />
        ) : (
          <FlatList
            data={filteredTimezones}
            keyExtractor={(item, index) => `${item.timezone}-${index}`}
            renderItem={renderTimezoneItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <IconSymbol
                  name="magnifyingglass"
                  size={48}
                  color={colors.muted}
                />
                <Text className="text-lg text-muted mt-4">No results found</Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}
