import type { Timezone, TimezoneWithTime, AppSettings } from "./types";

/**
 * Get current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: timezone })
  );
}

/**
 * Format time according to user preferences
 */
export function formatTime(date: Date, format: "12h" | "24h"): string {
  if (format === "24h") {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format date according to user preferences
 */
export function formatDate(
  date: Date,
  format: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

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
export function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Convert a time from one timezone to another
 */
export function convertTime(
  sourceTime: Date,
  sourceTimezone: string,
  targetTimezone: string
): Date {
  // Get the time in source timezone as a string
  const sourceTimeString = sourceTime.toLocaleString("en-US", {
    timeZone: sourceTimezone,
  });

  // Parse it back to a Date object
  const sourceDate = new Date(sourceTimeString);

  // Get the UTC timestamp
  const utcTime = sourceDate.getTime();

  // Create a new date in the target timezone
  const targetTimeString = new Date(utcTime).toLocaleString("en-US", {
    timeZone: targetTimezone,
  });

  return new Date(targetTimeString);
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
    formattedTime: formatTime(currentTime, settings.timeFormat),
    formattedDate: formatDate(currentTime, settings.dateFormat),
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
