import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Timezone, AppSettings, ExchangeRates } from "./types";

const STORAGE_KEYS = {
  TIMEZONES: "@world_clock_timezones",
  SETTINGS: "@world_clock_settings",
  EXCHANGE_RATES: "@world_clock_exchange_rates",
  EXCHANGE_RATES_TIMESTAMP: "@world_clock_exchange_rates_timestamp",
};

/**
 * Save user's selected timezones
 */
export async function saveTimezones(timezones: Timezone[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.TIMEZONES,
      JSON.stringify(timezones)
    );
  } catch (error) {
    console.error("Failed to save timezones:", error);
    throw error;
  }
}

/**
 * Load user's selected timezones
 */
export async function loadTimezones(): Promise<Timezone[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TIMEZONES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load timezones:", error);
    return [];
  }
}

/**
 * Add a new timezone to the list
 */
export async function addTimezone(timezone: Timezone): Promise<void> {
  const timezones = await loadTimezones();
  // Check if timezone already exists
  if (timezones.some((tz) => tz.id === timezone.id)) {
    return;
  }
  timezones.push(timezone);
  await saveTimezones(timezones);
}

/**
 * Remove a timezone from the list
 */
export async function removeTimezone(timezoneId: string): Promise<void> {
  const timezones = await loadTimezones();
  const filtered = timezones.filter((tz) => tz.id !== timezoneId);
  await saveTimezones(filtered);
}

/**
 * Save app settings
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SETTINGS,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error("Failed to save settings:", error);
    throw error;
  }
}

/**
 * Load app settings
 */
export async function loadSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          baseCurrency: "USD",
          timeFormat: "12h",
          dateFormat: "MM/DD/YYYY",
          theme: "auto",
        };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return {
      baseCurrency: "USD",
      timeFormat: "12h",
      dateFormat: "MM/DD/YYYY",
      theme: "auto",
    };
  }
}

/**
 * Cache exchange rates
 */
export async function cacheExchangeRates(rates: ExchangeRates): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.EXCHANGE_RATES,
      JSON.stringify(rates)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.EXCHANGE_RATES_TIMESTAMP,
      Date.now().toString()
    );
  } catch (error) {
    console.error("Failed to cache exchange rates:", error);
  }
}

/**
 * Load cached exchange rates
 * @returns Cached rates or null if cache is expired or doesn't exist
 */
export async function loadCachedExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EXCHANGE_RATES);
    const timestamp = await AsyncStorage.getItem(
      STORAGE_KEYS.EXCHANGE_RATES_TIMESTAMP
    );

    if (!data || !timestamp) {
      return null;
    }

    // Cache expires after 1 hour
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    const ONE_HOUR = 60 * 60 * 1000;

    if (cacheAge > ONE_HOUR) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load cached exchange rates:", error);
    return null;
  }
}
