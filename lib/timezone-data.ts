import type { Timezone } from "./types";

/**
 * Comprehensive list of major cities with their timezones and currencies
 */
export const TIMEZONE_DATA: Omit<Timezone, "id">[] = [
  // Asia
  { city: "Hong Kong", country: "Hong Kong", timezone: "Asia/Hong_Kong", currency: "HKD", utcOffset: "+08:00" },
  { city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", currency: "JPY", utcOffset: "+09:00" },
  { city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", currency: "SGD", utcOffset: "+08:00" },
  { city: "Shanghai", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Beijing", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Seoul", country: "South Korea", timezone: "Asia/Seoul", currency: "KRW", utcOffset: "+09:00" },
  { city: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", currency: "THB", utcOffset: "+07:00" },
  { city: "Mumbai", country: "India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30" },
  { city: "Dubai", country: "UAE", timezone: "Asia/Dubai", currency: "AED", utcOffset: "+04:00" },
  { city: "Manila", country: "Philippines", timezone: "Asia/Manila", currency: "PHP", utcOffset: "+08:00" },
  { city: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta", currency: "IDR", utcOffset: "+07:00" },
  { city: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", currency: "MYR", utcOffset: "+08:00" },
  { city: "Taipei", country: "Taiwan", timezone: "Asia/Taipei", currency: "TWD", utcOffset: "+08:00" },
  
  // Europe
  { city: "London", country: "United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00" },
  { city: "Paris", country: "France", timezone: "Europe/Paris", currency: "EUR", utcOffset: "+01:00" },
  { city: "Berlin", country: "Germany", timezone: "Europe/Berlin", currency: "EUR", utcOffset: "+01:00" },
  { city: "Rome", country: "Italy", timezone: "Europe/Rome", currency: "EUR", utcOffset: "+01:00" },
  { city: "Madrid", country: "Spain", timezone: "Europe/Madrid", currency: "EUR", utcOffset: "+01:00" },
  { city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam", currency: "EUR", utcOffset: "+01:00" },
  { city: "Zurich", country: "Switzerland", timezone: "Europe/Zurich", currency: "CHF", utcOffset: "+01:00" },
  { city: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm", currency: "SEK", utcOffset: "+01:00" },
  { city: "Moscow", country: "Russia", timezone: "Europe/Moscow", currency: "RUB", utcOffset: "+03:00" },
  { city: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul", currency: "TRY", utcOffset: "+03:00" },
  
  // Americas
  { city: "New York", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Los Angeles", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },
  { city: "Chicago", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Toronto", country: "Canada", timezone: "America/Toronto", currency: "CAD", utcOffset: "-05:00" },
  { city: "Vancouver", country: "Canada", timezone: "America/Vancouver", currency: "CAD", utcOffset: "-08:00" },
  { city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", currency: "MXN", utcOffset: "-06:00" },
  { city: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", currency: "BRL", utcOffset: "-03:00" },
  { city: "Buenos Aires", country: "Argentina", timezone: "America/Argentina/Buenos_Aires", currency: "ARS", utcOffset: "-03:00" },
  
  // Oceania
  { city: "Sydney", country: "Australia", timezone: "Australia/Sydney", currency: "AUD", utcOffset: "+11:00" },
  { city: "Melbourne", country: "Australia", timezone: "Australia/Melbourne", currency: "AUD", utcOffset: "+11:00" },
  { city: "Auckland", country: "New Zealand", timezone: "Pacific/Auckland", currency: "NZD", utcOffset: "+13:00" },
  
  // Africa
  { city: "Cairo", country: "Egypt", timezone: "Africa/Cairo", currency: "EGP", utcOffset: "+02:00" },
  { city: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg", currency: "ZAR", utcOffset: "+02:00" },
  { city: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", currency: "NGN", utcOffset: "+01:00" },
];

/**
 * Get timezone data by city name (case-insensitive search)
 */
export function searchTimezones(query: string): Omit<Timezone, "id">[] {
  const lowerQuery = query.toLowerCase();
  return TIMEZONE_DATA.filter(
    (tz) =>
      tz.city.toLowerCase().includes(lowerQuery) ||
      tz.country.toLowerCase().includes(lowerQuery) ||
      tz.timezone.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Group timezones by region
 */
export function getTimezonesByRegion(): Record<string, Omit<Timezone, "id">[]> {
  const regions: Record<string, Omit<Timezone, "id">[]> = {
    Asia: [],
    Europe: [],
    Americas: [],
    Oceania: [],
    Africa: [],
  };

  TIMEZONE_DATA.forEach((tz) => {
    if (tz.timezone.startsWith("Asia/")) {
      regions.Asia.push(tz);
    } else if (tz.timezone.startsWith("Europe/")) {
      regions.Europe.push(tz);
    } else if (tz.timezone.startsWith("America/")) {
      regions.Americas.push(tz);
    } else if (tz.timezone.startsWith("Australia/") || tz.timezone.startsWith("Pacific/")) {
      regions.Oceania.push(tz);
    } else if (tz.timezone.startsWith("Africa/")) {
      regions.Africa.push(tz);
    }
  });

  return regions;
}
