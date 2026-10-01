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
  { city: "Hanoi", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", currency: "VND", utcOffset: "+07:00" },
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

  // Canada
  { city: "Calgary", country: "Canada", timezone: "America/Edmonton", currency: "CAD", utcOffset: "-07:00" },
  { city: "Edmonton", country: "Canada", timezone: "America/Edmonton", currency: "CAD", utcOffset: "-07:00" },
  { city: "Ottawa", country: "Canada", timezone: "America/Toronto", currency: "CAD", utcOffset: "-05:00" },
  { city: "Quebec City", country: "Canada", timezone: "America/Toronto", currency: "CAD", utcOffset: "-05:00" },
  { city: "Winnipeg", country: "Canada", timezone: "America/Winnipeg", currency: "CAD", utcOffset: "-06:00" },
  { city: "Regina", country: "Canada", timezone: "America/Regina", currency: "CAD", utcOffset: "-06:00" },
  { city: "Saskatoon", country: "Canada", timezone: "America/Regina", currency: "CAD", utcOffset: "-06:00" },
  { city: "Halifax", country: "Canada", timezone: "America/Halifax", currency: "CAD", utcOffset: "-04:00" },
  { city: "St. John's", country: "Canada", timezone: "America/St_Johns", currency: "CAD", utcOffset: "-03:30" },
  { city: "Victoria", country: "Canada", timezone: "America/Vancouver", currency: "CAD", utcOffset: "-08:00" },
  { city: "Whitehorse", country: "Canada", timezone: "America/Whitehorse", currency: "CAD", utcOffset: "-07:00" },

  // United States
  { city: "Salt Lake City", country: "USA", timezone: "America/Denver", currency: "USD", utcOffset: "-07:00" },
  { city: "Albuquerque", country: "USA", timezone: "America/Denver", currency: "USD", utcOffset: "-07:00" },
  { city: "El Paso", country: "USA", timezone: "America/Denver", currency: "USD", utcOffset: "-07:00" },
  { city: "Boise", country: "USA", timezone: "America/Boise", currency: "USD", utcOffset: "-07:00" },
  { city: "Tucson", country: "USA", timezone: "America/Phoenix", currency: "USD", utcOffset: "-07:00" },
  { city: "Austin", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "San Antonio", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Fort Worth", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Midland", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Oklahoma City", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Tulsa", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Kansas City", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "St. Louis", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Minneapolis", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Milwaukee", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Omaha", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Nashville", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "New Orleans", country: "USA", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00" },
  { city: "Detroit", country: "USA", timezone: "America/Detroit", currency: "USD", utcOffset: "-05:00" },
  { city: "Indianapolis", country: "USA", timezone: "America/Indiana/Indianapolis", currency: "USD", utcOffset: "-05:00" },
  { city: "Columbus", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Pittsburgh", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Baltimore", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Charlotte", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Raleigh", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Orlando", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "Tampa", country: "USA", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00" },
  { city: "San Diego", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },
  { city: "San Jose", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },
  { city: "Sacramento", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },
  { city: "Portland", country: "USA", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00" },

  // Mexico, Central America and the Caribbean
  { city: "Monterrey", country: "Mexico", timezone: "America/Monterrey", currency: "MXN", utcOffset: "-06:00" },
  { city: "Guadalajara", country: "Mexico", timezone: "America/Mexico_City", currency: "MXN", utcOffset: "-06:00" },
  { city: "Cancún", country: "Mexico", timezone: "America/Cancun", currency: "MXN", utcOffset: "-05:00" },
  { city: "Tijuana", country: "Mexico", timezone: "America/Tijuana", currency: "MXN", utcOffset: "-08:00" },
  { city: "Guatemala City", country: "Guatemala", timezone: "America/Guatemala", currency: "GTQ", utcOffset: "-06:00" },
  { city: "San Salvador", country: "El Salvador", timezone: "America/El_Salvador", currency: "USD", utcOffset: "-06:00" },
  { city: "San José", country: "Costa Rica", timezone: "America/Costa_Rica", currency: "CRC", utcOffset: "-06:00" },
  { city: "Panama City", country: "Panama", timezone: "America/Panama", currency: "PAB", utcOffset: "-05:00" },
  { city: "Havana", country: "Cuba", timezone: "America/Havana", currency: "CUP", utcOffset: "-05:00" },
  { city: "Kingston", country: "Jamaica", timezone: "America/Jamaica", currency: "JMD", utcOffset: "-05:00" },
  { city: "Santo Domingo", country: "Dominican Republic", timezone: "America/Santo_Domingo", currency: "DOP", utcOffset: "-04:00" },
  { city: "San Juan", country: "Puerto Rico", timezone: "America/Puerto_Rico", currency: "USD", utcOffset: "-04:00" },

  // South America
  { city: "Medellín", country: "Colombia", timezone: "America/Bogota", currency: "COP", utcOffset: "-05:00" },
  { city: "Quito", country: "Ecuador", timezone: "America/Guayaquil", currency: "USD", utcOffset: "-05:00" },
  { city: "La Paz", country: "Bolivia", timezone: "America/La_Paz", currency: "BOB", utcOffset: "-04:00" },
  { city: "Asunción", country: "Paraguay", timezone: "America/Asuncion", currency: "PYG", utcOffset: "-03:00" },
  { city: "Montevideo", country: "Uruguay", timezone: "America/Montevideo", currency: "UYU", utcOffset: "-03:00" },
  { city: "Brasília", country: "Brazil", timezone: "America/Sao_Paulo", currency: "BRL", utcOffset: "-03:00" },
  { city: "Manaus", country: "Brazil", timezone: "America/Manaus", currency: "BRL", utcOffset: "-04:00" },

  // More of Europe
  { city: "Glasgow", country: "United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00" },
  { city: "Birmingham", country: "United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00" },
  { city: "Belfast", country: "United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00" },
  { city: "Cardiff", country: "United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00" },
  { city: "Porto", country: "Portugal", timezone: "Europe/Lisbon", currency: "EUR", utcOffset: "+00:00" },
  { city: "Seville", country: "Spain", timezone: "Europe/Madrid", currency: "EUR", utcOffset: "+01:00" },
  { city: "Marseille", country: "France", timezone: "Europe/Paris", currency: "EUR", utcOffset: "+01:00" },
  { city: "Nice", country: "France", timezone: "Europe/Paris", currency: "EUR", utcOffset: "+01:00" },
  { city: "Monaco", country: "Monaco", timezone: "Europe/Monaco", currency: "EUR", utcOffset: "+01:00" },
  { city: "Luxembourg", country: "Luxembourg", timezone: "Europe/Luxembourg", currency: "EUR", utcOffset: "+01:00" },
  { city: "Kraków", country: "Poland", timezone: "Europe/Warsaw", currency: "PLN", utcOffset: "+01:00" },
  { city: "Bratislava", country: "Slovakia", timezone: "Europe/Bratislava", currency: "EUR", utcOffset: "+01:00" },
  { city: "Ljubljana", country: "Slovenia", timezone: "Europe/Ljubljana", currency: "EUR", utcOffset: "+01:00" },
  { city: "Zagreb", country: "Croatia", timezone: "Europe/Zagreb", currency: "EUR", utcOffset: "+01:00" },
  { city: "Belgrade", country: "Serbia", timezone: "Europe/Belgrade", currency: "RSD", utcOffset: "+01:00" },
  { city: "Valletta", country: "Malta", timezone: "Europe/Malta", currency: "EUR", utcOffset: "+01:00" },
  { city: "Sofia", country: "Bulgaria", timezone: "Europe/Sofia", currency: "EUR", utcOffset: "+02:00" },
  { city: "Riga", country: "Latvia", timezone: "Europe/Riga", currency: "EUR", utcOffset: "+02:00" },
  { city: "Vilnius", country: "Lithuania", timezone: "Europe/Vilnius", currency: "EUR", utcOffset: "+02:00" },
  { city: "Tallinn", country: "Estonia", timezone: "Europe/Tallinn", currency: "EUR", utcOffset: "+02:00" },
  { city: "Kyiv", country: "Ukraine", timezone: "Europe/Kiev", currency: "UAH", utcOffset: "+02:00" },
  { city: "Nicosia", country: "Cyprus", timezone: "Asia/Nicosia", currency: "EUR", utcOffset: "+02:00" },
  { city: "Minsk", country: "Belarus", timezone: "Europe/Minsk", currency: "BYN", utcOffset: "+03:00" },
  { city: "Saint Petersburg", country: "Russia", timezone: "Europe/Moscow", currency: "RUB", utcOffset: "+03:00" },
  { city: "Tbilisi", country: "Georgia", timezone: "Asia/Tbilisi", currency: "GEL", utcOffset: "+04:00" },
  { city: "Yerevan", country: "Armenia", timezone: "Asia/Yerevan", currency: "AMD", utcOffset: "+04:00" },
  { city: "Baku", country: "Azerbaijan", timezone: "Asia/Baku", currency: "AZN", utcOffset: "+04:00" },

  // Middle East
  { city: "Abu Dhabi", country: "UAE", timezone: "Asia/Dubai", currency: "AED", utcOffset: "+04:00" },
  { city: "Muscat", country: "Oman", timezone: "Asia/Muscat", currency: "OMR", utcOffset: "+04:00" },
  { city: "Kuwait City", country: "Kuwait", timezone: "Asia/Kuwait", currency: "KWD", utcOffset: "+03:00" },
  { city: "Manama", country: "Bahrain", timezone: "Asia/Bahrain", currency: "BHD", utcOffset: "+03:00" },
  { city: "Jeddah", country: "Saudi Arabia", timezone: "Asia/Riyadh", currency: "SAR", utcOffset: "+03:00" },
  { city: "Baghdad", country: "Iraq", timezone: "Asia/Baghdad", currency: "IQD", utcOffset: "+03:00" },
  { city: "Amman", country: "Jordan", timezone: "Asia/Amman", currency: "JOD", utcOffset: "+03:00" },
  { city: "Beirut", country: "Lebanon", timezone: "Asia/Beirut", currency: "LBP", utcOffset: "+02:00" },
  { city: "Jerusalem", country: "Israel", timezone: "Asia/Jerusalem", currency: "ILS", utcOffset: "+02:00" },
  { city: "Tehran", country: "Iran", timezone: "Asia/Tehran", currency: "IRR", utcOffset: "+03:30" },

  // More of Asia
  { city: "Islamabad", country: "Pakistan", timezone: "Asia/Karachi", currency: "PKR", utcOffset: "+05:00" },
  { city: "Lahore", country: "Pakistan", timezone: "Asia/Karachi", currency: "PKR", utcOffset: "+05:00" },
  { city: "Chennai", country: "India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30" },
  { city: "Hyderabad", country: "India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30" },
  { city: "Kolkata", country: "India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30" },
  { city: "Pune", country: "India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30" },
  { city: "Malé", country: "Maldives", timezone: "Indian/Maldives", currency: "MVR", utcOffset: "+05:00" },
  { city: "Tashkent", country: "Uzbekistan", timezone: "Asia/Tashkent", currency: "UZS", utcOffset: "+05:00" },
  { city: "Ulaanbaatar", country: "Mongolia", timezone: "Asia/Ulaanbaatar", currency: "MNT", utcOffset: "+08:00" },
  { city: "Chiang Mai", country: "Thailand", timezone: "Asia/Bangkok", currency: "THB", utcOffset: "+07:00" },
  { city: "Phuket", country: "Thailand", timezone: "Asia/Bangkok", currency: "THB", utcOffset: "+07:00" },
  { city: "Pattaya", country: "Thailand", timezone: "Asia/Bangkok", currency: "THB", utcOffset: "+07:00" },
  { city: "Vientiane", country: "Laos", timezone: "Asia/Vientiane", currency: "LAK", utcOffset: "+07:00" },
  { city: "Da Nang", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", currency: "VND", utcOffset: "+07:00" },
  { city: "Bali", country: "Indonesia", timezone: "Asia/Makassar", currency: "IDR", utcOffset: "+08:00" },
  { city: "Cebu", country: "Philippines", timezone: "Asia/Manila", currency: "PHP", utcOffset: "+08:00" },
  { city: "Bandar Seri Begawan", country: "Brunei", timezone: "Asia/Brunei", currency: "BND", utcOffset: "+08:00" },
  { city: "Macau", country: "Macau", timezone: "Asia/Macau", currency: "MOP", utcOffset: "+08:00" },
  { city: "Hangzhou", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Wuhan", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Tianjin", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Xi'an", country: "China", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00" },
  { city: "Kaohsiung", country: "Taiwan", timezone: "Asia/Taipei", currency: "TWD", utcOffset: "+08:00" },
  { city: "Busan", country: "South Korea", timezone: "Asia/Seoul", currency: "KRW", utcOffset: "+09:00" },
  { city: "Sapporo", country: "Japan", timezone: "Asia/Tokyo", currency: "JPY", utcOffset: "+09:00" },
  { city: "Fukuoka", country: "Japan", timezone: "Asia/Tokyo", currency: "JPY", utcOffset: "+09:00" },

  // More of Oceania
  { city: "Adelaide", country: "Australia", timezone: "Australia/Adelaide", currency: "AUD", utcOffset: "+09:30" },
  { city: "Darwin", country: "Australia", timezone: "Australia/Darwin", currency: "AUD", utcOffset: "+09:30" },
  { city: "Hobart", country: "Australia", timezone: "Australia/Hobart", currency: "AUD", utcOffset: "+10:00" },
  { city: "Canberra", country: "Australia", timezone: "Australia/Sydney", currency: "AUD", utcOffset: "+10:00" },
  { city: "Gold Coast", country: "Australia", timezone: "Australia/Brisbane", currency: "AUD", utcOffset: "+10:00" },
  { city: "Christchurch", country: "New Zealand", timezone: "Pacific/Auckland", currency: "NZD", utcOffset: "+12:00" },
  { city: "Queenstown", country: "New Zealand", timezone: "Pacific/Auckland", currency: "NZD", utcOffset: "+12:00" },
  { city: "Suva", country: "Fiji", timezone: "Pacific/Fiji", currency: "FJD", utcOffset: "+12:00" },
  { city: "Port Moresby", country: "Papua New Guinea", timezone: "Pacific/Port_Moresby", currency: "PGK", utcOffset: "+10:00" },
  { city: "Guam", country: "Guam (USA)", timezone: "Pacific/Guam", currency: "USD", utcOffset: "+10:00" },
  { city: "Apia", country: "Samoa", timezone: "Pacific/Apia", currency: "WST", utcOffset: "+13:00" },
  { city: "Papeete", country: "French Polynesia", timezone: "Pacific/Tahiti", currency: "XPF", utcOffset: "-10:00" },

  // More of Africa
  { city: "Alexandria", country: "Egypt", timezone: "Africa/Cairo", currency: "EGP", utcOffset: "+02:00" },
  { city: "Marrakesh", country: "Morocco", timezone: "Africa/Casablanca", currency: "MAD", utcOffset: "+01:00" },
  { city: "Tunis", country: "Tunisia", timezone: "Africa/Tunis", currency: "TND", utcOffset: "+01:00" },
  { city: "Algiers", country: "Algeria", timezone: "Africa/Algiers", currency: "DZD", utcOffset: "+01:00" },
  { city: "Dakar", country: "Senegal", timezone: "Africa/Dakar", currency: "XOF", utcOffset: "+00:00" },
  { city: "Abidjan", country: "Côte d'Ivoire", timezone: "Africa/Abidjan", currency: "XOF", utcOffset: "+00:00" },
  { city: "Abuja", country: "Nigeria", timezone: "Africa/Lagos", currency: "NGN", utcOffset: "+01:00" },
  { city: "Kinshasa", country: "DR Congo", timezone: "Africa/Kinshasa", currency: "CDF", utcOffset: "+01:00" },
  { city: "Luanda", country: "Angola", timezone: "Africa/Luanda", currency: "AOA", utcOffset: "+01:00" },
  { city: "Khartoum", country: "Sudan", timezone: "Africa/Khartoum", currency: "SDG", utcOffset: "+02:00" },
  { city: "Kigali", country: "Rwanda", timezone: "Africa/Kigali", currency: "RWF", utcOffset: "+02:00" },
  { city: "Kampala", country: "Uganda", timezone: "Africa/Kampala", currency: "UGX", utcOffset: "+03:00" },
  { city: "Lusaka", country: "Zambia", timezone: "Africa/Lusaka", currency: "ZMW", utcOffset: "+02:00" },
  { city: "Harare", country: "Zimbabwe", timezone: "Africa/Harare", currency: "USD", utcOffset: "+02:00" },
  { city: "Maputo", country: "Mozambique", timezone: "Africa/Maputo", currency: "MZN", utcOffset: "+02:00" },
  { city: "Gaborone", country: "Botswana", timezone: "Africa/Gaborone", currency: "BWP", utcOffset: "+02:00" },
  { city: "Windhoek", country: "Namibia", timezone: "Africa/Windhoek", currency: "NAD", utcOffset: "+02:00" },
  { city: "Durban", country: "South Africa", timezone: "Africa/Johannesburg", currency: "ZAR", utcOffset: "+02:00" },
  { city: "Port Louis", country: "Mauritius", timezone: "Indian/Mauritius", currency: "MUR", utcOffset: "+04:00" },
  { city: "Victoria (Seychelles)", country: "Seychelles", timezone: "Indian/Mahe", currency: "SCR", utcOffset: "+04:00" },
];

/** A time zone people know by its short name (MST, CST, HKT…), offered next to the cities. */
export type TimeZoneEntry = Omit<Timezone, "id"> & { abbreviations: string[] };

/**
 * Time zones by name. `city` is what the row shows, `country` spells out the short names.
 * Where a short name means two things (CST, MST, IST, GMT) every meaning is listed.
 */
export const TIME_ZONE_ENTRIES: TimeZoneEntry[] = [
  { city: "Pacific Time", country: "PST / PDT · US & Canada", timezone: "America/Los_Angeles", currency: "USD", utcOffset: "-08:00", abbreviations: ["PT", "PST", "PDT", "PACIFIC"] },
  { city: "Mountain Time", country: "MST / MDT · US & Canada", timezone: "America/Denver", currency: "USD", utcOffset: "-07:00", abbreviations: ["MT", "MST", "MDT", "MOUNTAIN"] },
  { city: "Arizona Time", country: "MST all year · no daylight saving", timezone: "America/Phoenix", currency: "USD", utcOffset: "-07:00", abbreviations: ["MST", "ARIZONA"] },
  { city: "Central Time", country: "CST / CDT · US & Canada", timezone: "America/Chicago", currency: "USD", utcOffset: "-06:00", abbreviations: ["CT", "CST", "CDT", "CENTRAL"] },
  { city: "Eastern Time", country: "EST / EDT · US & Canada", timezone: "America/New_York", currency: "USD", utcOffset: "-05:00", abbreviations: ["ET", "EST", "EDT", "EASTERN"] },
  { city: "Atlantic Time", country: "AST / ADT · Canada", timezone: "America/Halifax", currency: "CAD", utcOffset: "-04:00", abbreviations: ["AT", "AST", "ADT", "ATLANTIC"] },
  { city: "Newfoundland Time", country: "NST / NDT · Canada", timezone: "America/St_Johns", currency: "CAD", utcOffset: "-03:30", abbreviations: ["NT", "NST", "NDT"] },
  { city: "Alaska Time", country: "AKST / AKDT · USA", timezone: "America/Anchorage", currency: "USD", utcOffset: "-09:00", abbreviations: ["AKT", "AKST", "AKDT", "ALASKA"] },
  { city: "Hawaii Time", country: "HST · USA", timezone: "Pacific/Honolulu", currency: "USD", utcOffset: "-10:00", abbreviations: ["HT", "HST", "HAST", "HAWAII"] },
  { city: "Brasília Time", country: "BRT · Brazil", timezone: "America/Sao_Paulo", currency: "BRL", utcOffset: "-03:00", abbreviations: ["BRT"] },
  { city: "Argentina Time", country: "ART · Argentina", timezone: "America/Argentina/Buenos_Aires", currency: "ARS", utcOffset: "-03:00", abbreviations: ["ART"] },
  { city: "UTC", country: "Coordinated Universal Time · GMT", timezone: "Etc/UTC", currency: "", utcOffset: "+00:00", abbreviations: ["UTC", "GMT", "Z", "ZULU"] },
  { city: "UK Time", country: "GMT / BST · United Kingdom", timezone: "Europe/London", currency: "GBP", utcOffset: "+00:00", abbreviations: ["GMT", "BST", "UK"] },
  { city: "Western European Time", country: "WET / WEST · Portugal", timezone: "Europe/Lisbon", currency: "EUR", utcOffset: "+00:00", abbreviations: ["WET", "WEST"] },
  { city: "Central European Time", country: "CET / CEST · most of Europe", timezone: "Europe/Paris", currency: "EUR", utcOffset: "+01:00", abbreviations: ["CET", "CEST", "MEZ"] },
  { city: "Eastern European Time", country: "EET / EEST · Greece, Finland, Romania…", timezone: "Europe/Athens", currency: "EUR", utcOffset: "+02:00", abbreviations: ["EET", "EEST"] },
  { city: "Moscow Time", country: "MSK · Russia", timezone: "Europe/Moscow", currency: "RUB", utcOffset: "+03:00", abbreviations: ["MSK"] },
  { city: "South Africa Time", country: "SAST · South Africa", timezone: "Africa/Johannesburg", currency: "ZAR", utcOffset: "+02:00", abbreviations: ["SAST"] },
  { city: "West Africa Time", country: "WAT · Nigeria and West Africa", timezone: "Africa/Lagos", currency: "NGN", utcOffset: "+01:00", abbreviations: ["WAT"] },
  { city: "East Africa Time", country: "EAT · Kenya and East Africa", timezone: "Africa/Nairobi", currency: "KES", utcOffset: "+03:00", abbreviations: ["EAT"] },
  { city: "Gulf Time", country: "GST · UAE and Oman", timezone: "Asia/Dubai", currency: "AED", utcOffset: "+04:00", abbreviations: ["GST"] },
  { city: "Pakistan Time", country: "PKT · Pakistan", timezone: "Asia/Karachi", currency: "PKR", utcOffset: "+05:00", abbreviations: ["PKT"] },
  { city: "India Time", country: "IST · India", timezone: "Asia/Kolkata", currency: "INR", utcOffset: "+05:30", abbreviations: ["IST"] },
  { city: "Indochina Time", country: "ICT · Thailand, Vietnam, Cambodia, Laos", timezone: "Asia/Bangkok", currency: "THB", utcOffset: "+07:00", abbreviations: ["ICT"] },
  { city: "Western Indonesia Time", country: "WIB · Jakarta", timezone: "Asia/Jakarta", currency: "IDR", utcOffset: "+07:00", abbreviations: ["WIB"] },
  { city: "China Time", country: "CST · China Standard Time", timezone: "Asia/Shanghai", currency: "CNY", utcOffset: "+08:00", abbreviations: ["CST", "CHINA", "BJT"] },
  { city: "Hong Kong Time", country: "HKT · Hong Kong", timezone: "Asia/Hong_Kong", currency: "HKD", utcOffset: "+08:00", abbreviations: ["HKT"] },
  { city: "Singapore Time", country: "SGT · Singapore", timezone: "Asia/Singapore", currency: "SGD", utcOffset: "+08:00", abbreviations: ["SGT"] },
  { city: "Philippine Time", country: "PHT · Philippines", timezone: "Asia/Manila", currency: "PHP", utcOffset: "+08:00", abbreviations: ["PHT", "PHST"] },
  { city: "Australian Western Time", country: "AWST · Perth", timezone: "Australia/Perth", currency: "AUD", utcOffset: "+08:00", abbreviations: ["AWST", "AWT"] },
  { city: "Korea Time", country: "KST · South Korea", timezone: "Asia/Seoul", currency: "KRW", utcOffset: "+09:00", abbreviations: ["KST"] },
  { city: "Japan Time", country: "JST · Japan", timezone: "Asia/Tokyo", currency: "JPY", utcOffset: "+09:00", abbreviations: ["JST"] },
  { city: "Australian Central Time", country: "ACST / ACDT · Adelaide", timezone: "Australia/Adelaide", currency: "AUD", utcOffset: "+09:30", abbreviations: ["ACST", "ACDT", "ACT"] },
  { city: "Australian Eastern Time", country: "AEST / AEDT · Sydney, Melbourne", timezone: "Australia/Sydney", currency: "AUD", utcOffset: "+10:00", abbreviations: ["AEST", "AEDT", "AET"] },
  { city: "Queensland Time", country: "AEST all year · Brisbane", timezone: "Australia/Brisbane", currency: "AUD", utcOffset: "+10:00", abbreviations: ["AEST"] },
  { city: "New Zealand Time", country: "NZST / NZDT · New Zealand", timezone: "Pacific/Auckland", currency: "NZD", utcOffset: "+12:00", abbreviations: ["NZT", "NZST", "NZDT"] },
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
 * Search cities and named time zones.
 * A short name such as "mst", "cst" or "hkt" lists the matching time zones first (every
 * meaning of an ambiguous one), then any cities that match by name.
 * City and country match case- and accent-insensitively. The time-zone
 * identifier matches lower-cased with its underscores kept, so "new york"
 * finds New York only and not every city in America/New_York.
 */
export function searchTimezones(query: string): Omit<Timezone, "id">[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const normalizedQuery = normalizeForSearch(trimmed);
  const lowerQuery = trimmed.toLowerCase();
  const upperQuery = trimmed.toUpperCase();
  const nameMatches = (tz: Omit<Timezone, "id">) =>
    normalizeForSearch(tz.city).includes(normalizedQuery) ||
    normalizeForSearch(tz.country).includes(normalizedQuery) ||
    tz.timezone.toLowerCase().includes(lowerQuery);

  const exactZones = TIME_ZONE_ENTRIES.filter((z) => z.abbreviations.includes(upperQuery));
  const otherZones = TIME_ZONE_ENTRIES.filter(
    (z) =>
      !exactZones.includes(z) &&
      ((upperQuery.length >= 2 && z.abbreviations.some((a) => a.startsWith(upperQuery))) ||
        normalizeForSearch(z.city).includes(normalizedQuery))
  );
  const cities = TIMEZONE_DATA.filter(nameMatches);
  return [...exactZones, ...otherZones, ...cities].map(stripAbbreviations);
}

/** Saved entries keep only the Timezone fields. */
function stripAbbreviations(tz: Omit<Timezone, "id"> | TimeZoneEntry): Omit<Timezone, "id"> {
  const { city, country, timezone, currency, utcOffset } = tz;
  return { city, country, timezone, currency, utcOffset };
}

/** The named time zones (Mountain Time, Hong Kong Time…) for the Add screen's Time zones tab. */
export function getNamedTimeZones(): Omit<Timezone, "id">[] {
  return TIME_ZONE_ENTRIES.map(stripAbbreviations);
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
    } else if (tz.timezone.startsWith("Europe/") || tz.timezone.startsWith("Atlantic/")) {
      regions.Europe.push(tz);
    } else if (tz.timezone.startsWith("America/")) {
      regions.Americas.push(tz);
    } else if (tz.timezone.startsWith("Australia/") || tz.timezone.startsWith("Pacific/")) {
      regions.Oceania.push(tz);
    } else if (tz.timezone.startsWith("Africa/") || tz.timezone === "Indian/Mauritius" || tz.timezone === "Indian/Mahe") {
      regions.Africa.push(tz);
    } else if (tz.timezone.startsWith("Indian/")) {
      regions.Asia.push(tz);
    }
  });

  return regions;
}
