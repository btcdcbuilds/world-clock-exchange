/**
 * Pure helpers for planning meetings across timezones.
 *
 * All instants are plain `Date` objects (UTC under the hood). "Wall time" means
 * the calendar date and clock time a person sees in a given IANA timezone.
 * Nothing here depends on the device's own timezone, so results are the same
 * on every phone.
 */

export interface WallTime {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
}

export type HourStatus = "work" | "edge" | "night";

/** Working hours: 09:00–17:59. Edge (early/late but reasonable): 07:00–08:59 and 18:00–21:59. */
export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;
export const EDGE_START_HOUR = 7;
export const EDGE_END_HOUR = 22;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** The wall-clock date and time shown in `timeZone` at the instant `date`. */
export function getWallTime(date: Date, timeZone: string): WallTime {
  const parts = getPartsFormatter(timeZone).formatToParts(date);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
  let hour = get("hour");
  // Some engines report midnight as hour 24
  if (hour === 24) hour = 0;
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour,
    minute: get("minute"),
  };
}

/** Minutes east of UTC for `timeZone` at the instant `date` (e.g. +330 for India). */
export function getOffsetMinutes(timeZone: string, date: Date): number {
  const w = getWallTime(date, timeZone);
  const asUtc = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute);
  const truncated = Math.floor(date.getTime() / 60000) * 60000;
  return Math.round((asUtc - truncated) / 60000);
}

/** Format an offset in minutes as "GMT+5:30", "GMT-4", "GMT". */
export function formatOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "GMT";
  const sign = offsetMinutes > 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/**
 * The instant at which the clock in `timeZone` shows `wall`.
 * Handles DST: a wall time skipped by a spring-forward gap resolves to the
 * moment just after the gap; an ambiguous fall-back time resolves to the
 * earlier of the two instants.
 */
export function zonedWallTimeToUtc(wall: WallTime, timeZone: string): Date {
  const guess = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  const offset1 = getOffsetMinutes(timeZone, new Date(guess));
  let result = guess - offset1 * 60000;
  const offset2 = getOffsetMinutes(timeZone, new Date(result));
  if (offset2 !== offset1) {
    const alt = guess - offset2 * 60000;
    // Prefer the candidate whose wall time actually matches
    const w = getWallTime(new Date(alt), timeZone);
    if (w.hour === wall.hour && w.minute === wall.minute) {
      result = alt;
    } else {
      result = Math.max(result, alt);
    }
  }
  return new Date(result);
}

/** Add whole days to a calendar date (no timezone involved). */
export function addDays(wall: WallTime, days: number): WallTime {
  const d = new Date(Date.UTC(wall.year, wall.month - 1, wall.day + days));
  return {
    ...wall,
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/** Calendar-day difference between two wall dates (b - a). */
type CalendarDay = Pick<WallTime, "year" | "month" | "day">;

export function dayDifference(a: CalendarDay, b: CalendarDay): number {
  const da = Date.UTC(a.year, a.month - 1, a.day);
  const db = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((db - da) / 86400000);
}

export function getHourStatus(hour: number): HourStatus {
  if (hour >= WORK_START_HOUR && hour < WORK_END_HOUR) return "work";
  if (hour >= EDGE_START_HOUR && hour < EDGE_END_HOUR) return "edge";
  return "night";
}

/**
 * How good a meeting from `start` to `end` is for someone in `timeZone`.
 * "work" only if the whole meeting sits inside 09:00–18:00 local time.
 */
export function getMeetingStatus(start: Date, end: Date, timeZone: string): HourStatus {
  const s = getWallTime(start, timeZone);
  const lastMinute = new Date(end.getTime() - 60000);
  const e = getWallTime(lastMinute, timeZone);
  const sameDay = dayDifference(s, e) === 0;
  const sMin = s.hour * 60 + s.minute;
  const eMin = e.hour * 60 + e.minute + 1;
  if (sameDay && sMin >= WORK_START_HOUR * 60 && eMin <= WORK_END_HOUR * 60) return "work";
  if (sameDay && sMin >= EDGE_START_HOUR * 60 && eMin <= EDGE_END_HOUR * 60) return "edge";
  return "night";
}

const STATUS_SCORE: Record<HourStatus, number> = { work: 2, edge: 1, night: 0 };

export interface SuggestedSlot {
  start: Date;
  hostWall: WallTime;
  workCount: number;
  edgeCount: number;
  nightCount: number;
}

/**
 * Rank start times on the host's chosen day (every 30 minutes) by how many
 * participants would be inside working hours. Returns the best `limit` slots,
 * earliest first among equals.
 */
export function suggestMeetingTimes(
  hostDate: Pick<WallTime, "year" | "month" | "day">,
  hostTimeZone: string,
  participantTimeZones: string[],
  durationMinutes: number,
  limit = 3
): SuggestedSlot[] {
  const zones = Array.from(new Set(participantTimeZones));
  if (zones.length === 0) return [];

  const slots: (SuggestedSlot & { score: number })[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += 30) {
    const hostWall: WallTime = {
      ...hostDate,
      hour: Math.floor(minutes / 60),
      minute: minutes % 60,
    };
    const start = zonedWallTimeToUtc(hostWall, hostTimeZone);
    // Skip wall times that don't exist on this day (DST gap)
    const check = getWallTime(start, hostTimeZone);
    if (check.hour !== hostWall.hour || check.minute !== hostWall.minute) continue;
    const end = new Date(start.getTime() + durationMinutes * 60000);
    let workCount = 0;
    let edgeCount = 0;
    let nightCount = 0;
    let score = 0;
    for (const tz of zones) {
      const status = getMeetingStatus(start, end, tz);
      score += STATUS_SCORE[status];
      if (status === "work") workCount++;
      else if (status === "edge") edgeCount++;
      else nightCount++;
    }
    slots.push({ start, hostWall, workCount, edgeCount, nightCount, score });
  }

  // Worst case matters most: avoid anyone at night, then maximise working hours
  slots.sort(
    (a, b) =>
      a.nightCount - b.nightCount ||
      b.workCount - a.workCount ||
      b.score - a.score ||
      a.start.getTime() - b.start.getTime()
  );

  return slots
    .slice(0, limit)
    .map(({ score: _score, ...rest }) => rest)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function toCalendarStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** A Google Calendar "create event" link pre-filled with the meeting. */
export function buildGoogleCalendarUrl(
  title: string,
  start: Date,
  end: Date,
  details: string
): string {
  const params = [
    "action=TEMPLATE",
    `text=${encodeURIComponent(title || "Meeting")}`,
    `dates=${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    `details=${encodeURIComponent(details)}`,
  ];
  return `https://calendar.google.com/calendar/render?${params.join("&")}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function isWeekend(wall: Pick<WallTime, "year" | "month" | "day">): boolean {
  const day = new Date(Date.UTC(wall.year, wall.month - 1, wall.day)).getUTCDay();
  return day === 0 || day === 6;
}

export function getWeekday(wall: Pick<WallTime, "year" | "month" | "day">): string {
  return WEEKDAYS[new Date(Date.UTC(wall.year, wall.month - 1, wall.day)).getUTCDay()];
}

export function getMonthName(month: number): string {
  return MONTHS[month - 1];
}

/** "2:05 PM" or "14:05" */
export function formatClock(hour: number, minute: number, format: "12h" | "24h"): string {
  const mm = String(minute).padStart(2, "0");
  if (format === "24h") return `${String(hour).padStart(2, "0")}:${mm}`;
  const suffix = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${mm} ${suffix}`;
}

/** "Mon, Oct 12" / "Mon 12 Oct" / "Mon 2026-10-12" depending on the user's date format */
export function formatWallDate(
  wall: Pick<WallTime, "year" | "month" | "day">,
  format: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD"
): string {
  const weekday = getWeekday(wall);
  const month = getMonthName(wall.month);
  switch (format) {
    case "DD/MM/YYYY":
      return `${weekday} ${wall.day} ${month}`;
    case "YYYY-MM-DD":
      return `${weekday} ${wall.year}-${String(wall.month).padStart(2, "0")}-${String(wall.day).padStart(2, "0")}`;
    default:
      return `${weekday}, ${month} ${wall.day}`;
  }
}

/** The device's own IANA timezone, falling back to UTC. */
export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** "America/New_York" -> "New York" */
export function cityFromTimeZone(timeZone: string): string {
  return (timeZone.split("/").pop() || timeZone).replace(/_/g, " ");
}
