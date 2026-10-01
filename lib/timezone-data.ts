import type { Timezone } from "./types";

/**
 * Comprehensive list of major cities with their timezones and currencies
 */
export const TIMEZONE_DATA: Omit<Timezone, "id">[] = [
  // Asia
  { city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", currency: "JPY", utcOffset: "+09:00" },
  { city: "Hong Kong", country: "Hong Kong", timezone: "Asia/Hong_Kong", currency: "HKD", utcOffset: "+08:00" },
  { city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", currency: "SGD", utcOffset: "+08:00" },
  { city: "Shanghai", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Beijing", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Seoul", country: "South Korea", timezone: "Asia/Seoul", currency: "KRW", utcOffset: "+09:00" },
  { city: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", currency: "THB", utcOffset: "+07:00" },
  { city: "Mumbai", country: "India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30" },
  { city: "Delhi", country: "India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30" },
  { city: "Bangalore", country: "India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30" },
  { city: "Dubai", country: "UAE", timezone: "Asia/Dubai", currency: "AED", utcOffset: "+04:00" },
  { city: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta", currency: "IDR", utcOffset: "+07:00" },
  { city: "Manila", country: "Philippines", timezone: "Asia/Manila", currency: "PHP", utcOffset: "+08:00" },
  { city: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", currency: "MYR", utcOffset: "+08:00" },
  { city: "Tel Aviv", country: "Israel", timezone: "Asia/Jerusalem", currency: "ILS", utcOffset: "+02:00" },
  { city: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul", currency: "TRY", utcOffset: "+03:00" },
  { city: "Riyadh", country: "Saudi Arabia", timezone: "Asia/Riyadh", currency: "SAR", utcOffset: "+03:00" },
  { city: "Doha", country: "Qatar", timezone: "Asia/Qatar", currency: "QAR", utcOffset: "+03:00" },
  { city: "Taipei", country: "Taiwan", timezone: "Asia/Taipei", currency: "TWD", utcOffset: "+08:00" },
  { city: "Ho Chi Minh City", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", currency: "VND", utcOffset: "+07:00" },
  { city: "Hanoi", country: "Vietnam", timezone: "Asia/Bangkok", currency: "VND", utcOffset: "+07:00" },
  { city: "Osaka", country: "Japan", timezone: "Asia/Tokyo", currency: "JPY", utcOffset: "+09:00" },
  { city: "Kyoto", country: "Japan", timezone: "Asia/Tokyo", currency: "JPY", utcOffset: "+09:00" },
  { city: "Guangzhou", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Shenzhen", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Chengdu", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Phnom Penh", country: "Cambodia", timezone: "Asia/Phnom_Penh", currency: "KHR", utcOffset: "+07:00" },
  { city: "Yangon", country: "Myanmar", timezone: "Asia/Yangon", currency: "MMK", utcOffset: "+06:30" },
  { city: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", currency: "BDT", utcOffset: "+06:00" },
  { city: "Karachi", country: "Pakistan", timezone: "Asia/Karachi", currency: "PKR", utcOffset: "+05:00" },
  { city: "Colombo", country: "Sri Lanka", timezone: "Asia/Colombo", currency: "LKR", utcOffset: "+05:30" },
  { city: "Kathmandu", country: "Nepal", timezone: "Asia/Kathmandu", currency: "NPR", utcOffset: "+05:45" },
  { city: "Almaty", country: "Kazakhstan", timezone: "Asia/Almaty", currency: "KZT", utcOffset: "+06:00" },
  
  // Europe
  { city: "London", country: "United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00" },
  { city: "Paris", country: "France", timezone: "Europe/Paris", currency: "EUR", utcOffset: "+01:00" },
  { city: "Berlin", country: "Germany", timezone: "Europe/Berlin", currency: "EUR", utcOffset: "+01:00" },
  { city: "Frankfurt", country: "Germany", timezone: "Europe/Berlin", currency: "EUR", utcOffset: "+01:00" },
  { city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam", currency: "EUR", utcOffset: "+01:00" },
  { city: "Madrid", country: "Spain", timezone: "Europe/Madrid", currency: "EUR", utcOffset: "+01:00" },
  { city: "Rome", country: "Italy", timezone: "Europe/Rome", currency: "EUR", utcOffset: "+01:00" },
  { city: "Milan", country: "Italy", timezone: "Europe/Rome", currency: "EUR", utcOffset: "+01:00" },
  { city: "Zurich", country: "Switzerland", timezone: "Europe/Zurich", currency: "CHF", utcOffset: "+01:00" },
  { city: "Geneva", country: "Switzerland", timezone: "Europe/Zurich", currency: "CHF", utcOffset: "+01:00" },
  { city: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm", currency: "SEK", utcOffset: "+01:00" },
  { city: "Copenhagen", country: "Denmark", timezone: "Europe/Copenhagen", currency: "DKK", utcOffset: "+01:00" },
  { city: "Oslo", country: "Norway", timezone: "Europe/Oslo", currency: "NOK", utcOffset: "+01:00" },
  { city: "Helsinki", country: "Finland", timezone: "Europe/Helsinki", currency: "EUR", utcOffset: "+02:00" },
  { city: "Moscow", country: "Russia", timezone: "Europe/Moscow", currency: "RUB", utcOffset: "+03:00" },
  { city: "Warsaw", country: "Poland", timezone: "Europe/Warsaw", currency: "PLN", utcOffset: "+01:00" },
  { city: "Prague", country: "Czech Republic", timezone: "Europe/Prague", currency: "CZK", utcOffset: "+01:00" },
  { city: "Vienna", country: "Austria", timezone: "Europe/Vienna", currency: "EUR", utcOffset: "+01:00" },
  { city: "Brussels", country: "Belgium", timezone: "Europe/Brussels", currency: "EUR", utcOffset: "+01:00" },
  { city: "Dublin", country: "Ireland", timezone: "Europe/Dublin", currency: "EUR", utcOffset: "+00:00" },
  { city: "Lisbon", country: "Portugal", timezone: "Europe/Lisbon", currency: "EUR", utcOffset: "+00:00" },
  { city: "Athens", country: "Greece", timezone: "Europe/Athens", currency: "EUR", utcOffset: "+02:00" },
  { city: "Budapest", country: "Hungary", timezone: "Europe/Budapest", currency: "HUF", utcOffset: "+01:00" },
  { city: "Bucharest", country: "Romania", timezone: "Europe/Bucharest", currency: "RON", utcOffset: "+02:00" },
  { city: "Reykjavik", country: "Iceland", timezone: "Atlantic/Reykjavik", currency: "ISK", utcOffset: "+00:00" },
  { city: "Edinburgh", country: "United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00" },
  { city: "Manchester", country: "United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00" },
  { city: "Lyon", country: "France", timezone: "Europe/Paris", currency: "EUR", utcOffset: "+01:00" },
  { city: "Munich", country: "Germany", timezone: "Europe/Berlin", currency: "EUR", utcOffset: "+01:00" },
  { city: "Hamburg", country: "Germany", timezone: "Europe/Berlin", currency: "EUR", utcOffset: "+01:00" },
  { city: "Barcelona", country: "Spain", timezone: "Europe/Madrid", currency: "EUR", utcOffset: "+01:00" },
  { city: "Valencia", country: "Spain", timezone: "Europe/Madrid", currency: "EUR", utcOffset: "+01:00" },
  { city: "Naples", country: "Italy", timezone: "Europe/Rome", currency: "EUR", utcOffset: "+01:00" },
  { city: "Turin", country: "Italy", timezone: "Europe/Rome", currency: "EUR", utcOffset: "+01:00" },
  
  // Americas
  { city: "New York", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Los Angeles", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },
  { city: "Chicago", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "San Francisco", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },
  { city: "Seattle", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },
  { city: "Boston", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Miami", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Denver", country: "USA", timezone: "America/Denver", currency: "USD", utcOffset: "-07:00" },
  { city: "Phoenix", country: "USA", timezone: "America/Phoenix", currency: "USD", utcOffset: "-07:00" },
  { city: "Toronto", country: "Canada", timezone: "America/Toronto", currency: "CAD", utcOffset: "-05:00" },
  { city: "Vancouver", country: "Canada", timezone: "America/Vancouver", currency: "CAD", utcOffset: "-08:00" },
  { city: "Montreal", country: "Canada", timezone: "America/Toronto", currency: "CAD", utcOffset: "-05:00" },
  { city: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", currency: "MXN", utcOffset: "-06:00" },
  { city: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", currency: "BRL", utcOffset: "-03:00" },
  { city: "Rio de Janeiro", country: "Brazil", timezone: "America/Sao_Paulo", currency: "BRL", utcOffset: "-03:00" },
  { city: "Buenos Aires", country: "Argentina", timezone: "America/Argentina/Buenos_Aires", currency: "ARS", utcOffset: "-03:00" },
  { city: "Santiago", country: "Chile", timezone: "America/Santiago", currency: "CLP", utcOffset: "-03:00" },
  { city: "Lima", country: "Peru", timezone: "America/Lima", currency: "PEN", utcOffset: "-05:00" },
  { city: "Bogotá", country: "Colombia", timezone: "America/Bogota", currency: "COP", utcOffset: "-05:00" },
  { city: "Caracas", country: "Venezuela", timezone: "America/Caracas", currency: "VES", utcOffset: "-04:00" },
  { city: "Honolulu", country: "USA", timezone: "Pacific/Honolulu", currency: "USD", utcOffset: "-10:00" },
  { city: "Anchorage", country: "USA", timezone: "America/Anchorage", currency: "USD", utcOffset: "-09:00" },
  { city: "Las Vegas", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },
  { city: "Atlanta", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Dallas", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Houston", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Philadelphia", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Washington DC", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  
  // Oceania
  { city: "Sydney", country: "Australia", timezone: "Australia/Sydney", currency: "AUD", utcOffset: "+11:00" },
  { city: "Melbourne", country: "Australia", timezone: "Australia/Melbourne", currency: "AUD", utcOffset: "+11:00" },
  { city: "Brisbane", country: "Australia", timezone: "Australia/Brisbane", currency: "AUD", utcOffset: "+10:00" },
  { city: "Perth", country: "Australia", timezone: "Australia/Perth", currency: "AUD", utcOffset: "+08:00" },
  { city: "Auckland", country: "New Zealand", timezone: "Pacific/Auckland", currency: "NZD", utcOffset: "+13:00" },
  { city: "Wellington", country: "New Zealand", timezone: "Pacific/Auckland", currency: "NZD", utcOffset: "+13:00" },
  
  // Africa
  { city: "Cairo", country: "Egypt", timezone: "Africa/Cairo", currency: "EGP", utcOffset: "+02:00" },
  { city: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg", currency: "ZAR", utcOffset: "+02:00" },
  { city: "Cape Town", country: "South Africa", timezone: "Africa/Johannesburg", currency: "ZAR", utcOffset: "+02:00" },
  { city: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", currency: "NGN", utcOffset: "+01:00" },
  { city: "Nairobi", country: "Kenya", timezone: "Africa/Nairobi", currency: "KES", utcOffset: "+03:00" },
  { city: "Casablanca", country: "Morocco", timezone: "Africa/Casablanca", currency: "MAD", utcOffset: "+01:00" },
  { city: "Accra", country: "Ghana", timezone: "Africa/Accra", currency: "GHS", utcOffset: "+00:00" },
  { city: "Addis Ababa", country: "Ethiopia", timezone: "Africa/Addis_Ababa", currency: "ETB", utcOffset: "+03:00" },
  { city: "Dar es Salaam", country: "Tanzania", timezone: "Africa/Dar_es_Salaam", currency: "TZS", utcOffset: "+03:00" },
];

/**
 * Lower-case and strip accents, so "Sao Paulo" matches "São Paulo".
 * Used for the city and country names only.
 */
function normalizeForSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Get timezone data by city name.
 * City and country match case- and accent-insensitively. The time-zone
 * identifier matches lower-cased with its underscores kept, so "new york"
 * finds New York only and not every city in America/New_York.
 */
export function searchTimezones(query: string): Omit<Timezone, "id">[] {
  const trimmed = query.trim();
  const normalizedQuery = normalizeForSearch(trimmed);
  const lowerQuery = trimmed.toLowerCase();
  return TIMEZONE_DATA.filter(
    (tz) =>
      normalizeForSearch(tz.city).includes(normalizedQuery) ||
      normalizeForSearch(tz.country).includes(normalizedQuery) ||
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
