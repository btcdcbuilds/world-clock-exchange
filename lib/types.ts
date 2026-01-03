export interface Timezone {
  id: string;
  city: string;
  country: string;
  timezone: string; // IANA timezone identifier (e.g., "Asia/Hong_Kong")
  currency: string; // ISO currency code (e.g., "HKD")
  utcOffset: string; // e.g., "+08:00"
}

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface TimezoneWithTime extends Timezone {
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  exchangeRate: number | null;
}

export interface MeetingTime {
  sourceTimezone: string;
  dateTime: Date;
  convertedTimes: Array<{
    timezone: Timezone;
    localTime: Date;
    formattedTime: string;
    formattedDate: string;
    exchangeRate: number | null;
  }>;
}

export interface AppSettings {
  baseCurrency: string;
  timeFormat: "12h" | "24h";
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  theme: "light" | "dark" | "auto";
}
