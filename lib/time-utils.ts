import type { Timezone, TimezoneWithTime, AppSettings } from "./types";

/**
 * Get current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || "0";

  const year = parseInt(getValue("year"));
  const month = parseInt(getValue("month")) - 1;
  const day = parseInt(getValue("day"));
  let hour = parseInt(getValue("hour"));
  // Some engines return hour "24" for midnight; normalize to 0
  if (hour === 24) hour = 0;
  const minute = parseInt(getValue("minute"));
  const second = parseInt(getValue("second"));

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Format time according to user preferences, with optional timezone support
 */
export function formatTime(
  date: Date,
  format: "12h" | "24h",
  timezone?: string
): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: format === "12h",
  };
  if (timezone) {
    options.timeZone = timezone;
  }
  return date.toLocaleTimeString("en-US", options);
}

/**
 * Format date according to user preferences, with optional timezone support
 */
export function formatDate(
  date: Date,
  format: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD",
  timezone?: string
): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  if (timezone) {
    options.timeZone = timezone;
  }

  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(date);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || "";

  const month = getValue("month");
  const day = getValue("day");
  const year = getValue("year");

  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;
    default:
      return `${month}/${day}/${year}`;
  }
}

/**
 * Get day of week name
 */
export function getDayOfWeek(date: Date, timezone?: string): string {
  const options: Intl.DateTimeFormatOptions = { weekday: "short" };
  if (timezone) {
    options.timeZone = timezone;
  }
  return date.toLocaleDateString("en-US", options);
}

/**
 * Convert a time from one timezone to another
 */
export function convertTime(
  sourceTime: Date,
  sourceTimezone: string,
  targetTimezone: string
): Date {
  // Format the source time in the target timezone using Intl
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: targetTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(sourceTime);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || "0";

  const year = parseInt(getValue("year"));
  const month = parseInt(getValue("month")) - 1;
  const day = parseInt(getValue("day"));
  let hour = parseInt(getValue("hour"));
  if (hour === 24) hour = 0;
  const minute = parseInt(getValue("minute"));
  const second = parseInt(getValue("second"));

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Get timezone abbreviation (e.g., "HKT", "EST")
 */
export function getTimezoneAbbreviation(timezone: string): string {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(date);
  const timeZonePart = parts.find((part) => part.type === "timeZoneName");

  return timeZonePart?.value || timezone.split("/").pop() || timezone;
}

/**
 * Get UTC offset for a timezone (e.g., "+08:00")
 */
export function getUTCOffset(timezone: string): string {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  });

  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName");

  if (offsetPart?.value.startsWith("GMT")) {
    const offset = offsetPart.value.replace("GMT", "");
    if (offset === "") return "+00:00";
    return offset;
  }

  return "+00:00";
}

/**
 * Enrich timezone data with current time information
 */
export function enrichTimezoneWithTime(
  timezone: Timezone,
  settings: AppSettings,
  exchangeRate: number | null
): TimezoneWithTime {
  const currentTime = getCurrentTimeInTimezone(timezone.timezone);

  return {
    ...timezone,
    currentTime,
    formattedTime: formatTime(new Date(), settings.timeFormat, timezone.timezone),
    formattedDate: formatDate(new Date(), settings.dateFormat, timezone.timezone),
    exchangeRate,
  };
}

/**
 * Get relative time difference between two timezones
 */
export function getTimeDifference(timezone1: string, timezone2: string): string {
  const date = new Date();
  const time1 = new Date(
    date.toLocaleString("en-US", { timeZone: timezone1 })
  );
  const time2 = new Date(
    date.toLocaleString("en-US", { timeZone: timezone2 })
  );

  const diffMs = time1.getTime() - time2.getTime();
  const diffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60));

  const sign = diffMs >= 0 ? "+" : "-";
  return `${sign}${diffHours}h ${diffMinutes}m`;
}
