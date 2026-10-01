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

export type HourStatus = "good" | "edge" | "night";

/**
 * Reasonable hours for a call (not office hours): 08:00–20:59.
 * Early / late but possible: 07:00–07:59 and 21:00–21:59. Anything else is night.
 */
export const GOOD_START_HOUR = 8;
export const GOOD_END_HOUR = 21;
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
  if (hour >= GOOD_START_HOUR && hour < GOOD_END_HOUR) return "good";
  if (hour >= EDGE_START_HOUR && hour < EDGE_END_HOUR) return "edge";
  return "night";
}

/**
 * How good a meeting from `start` to `end` is for someone in `timeZone`.
 * "good" only if the whole meeting sits inside 08:00–21:00 local time.
 */
export function getMeetingStatus(start: Date, end: Date, timeZone: string): HourStatus {
  const s = getWallTime(start, timeZone);
  const lastMinute = new Date(end.getTime() - 60000);
  const e = getWallTime(lastMinute, timeZone);
  const sameDay = dayDifference(s, e) === 0;
  const sMin = s.hour * 60 + s.minute;
  const eMin = e.hour * 60 + e.minute + 1;
  if (sameDay && sMin >= GOOD_START_HOUR * 60 && eMin <= GOOD_END_HOUR * 60) return "good";
  if (sameDay && sMin >= EDGE_START_HOUR * 60 && eMin <= EDGE_END_HOUR * 60) return "edge";
  return "night";
}

/** Start times are tried every 15 minutes, the same step the time scrubber snaps to. */
export const SLOT_STEP_MINUTES = 15;

interface SlotScore {
  /** Minutes after 00:00 on the host's day. */
  minutes: number;
  start: Date;
  hostWall: WallTime;
  goodCount: number;
  edgeCount: number;
  nightCount: number;
  /** How far the meeting is from mid-afternoon for the person worst off (lower is better). */
  strain: number;
}

function scoreSlots(
  hostDate: Pick<WallTime, "year" | "month" | "day">,
  hostTimeZone: string,
  zones: string[],
  durationMinutes: number
): SlotScore[] {
  const slots: SlotScore[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += SLOT_STEP_MINUTES) {
    const hostWall: WallTime = { ...hostDate, hour: Math.floor(minutes / 60), minute: minutes % 60 };
    const start = zonedWallTimeToUtc(hostWall, hostTimeZone);
    // Skip wall times that don't exist on this day (DST gap)
    const check = getWallTime(start, hostTimeZone);
    if (check.hour !== hostWall.hour || check.minute !== hostWall.minute) continue;
    const end = new Date(start.getTime() + durationMinutes * 60000);
    let goodCount = 0;
    let edgeCount = 0;
    let nightCount = 0;
    let strain = 0;
    for (const tz of zones) {
      const status = getMeetingStatus(start, end, tz);
      if (status === "good") goodCount++;
      else if (status === "edge") edgeCount++;
      else nightCount++;
      const local = getWallTime(start, tz);
      const middle = local.hour + local.minute / 60 + durationMinutes / 120;
      strain = Math.max(strain, Math.abs(middle - 14));
    }
    slots.push({ minutes, start, hostWall, goodCount, edgeCount, nightCount, strain });
  }
  return slots;
}

export interface SuggestedSlot {
  start: Date;
  hostWall: WallTime;
  goodCount: number;
  edgeCount: number;
  nightCount: number;
}

/**
 * Up to `limit` start times on the host's day that suit everyone best, at least two hours
 * apart so they are real alternatives, earliest first. Only the best tier is returned, so a
 * time that suits everyone is never listed next to one that suits fewer people.
 *
 * Fewest people at night comes first, then most people inside reasonable hours, then the
 * time closest to mid-afternoon for whoever is worst off. The host (the phone's own time
 * zone) is never offered a time at night, and at least one person must be inside reasonable hours.
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
  const ranked = scoreSlots(hostDate, hostTimeZone, zones, durationMinutes)
    .filter((s) => s.goodCount > 0)
    .filter((s) => {
      const end = new Date(s.start.getTime() + durationMinutes * 60000);
      return getMeetingStatus(s.start, end, hostTimeZone) !== "night";
    })
    .sort(
      (a, b) =>
        a.nightCount - b.nightCount ||
        b.goodCount - a.goodCount ||
        a.strain - b.strain ||
        a.minutes - b.minutes
    );
  // Only offer the best tier: if some times suit everyone, never pad the list with worse ones.
  const best = ranked[0];
  const topTier = best
    ? ranked.filter((s) => s.nightCount === best.nightCount && s.goodCount === best.goodCount)
    : [];
  const picked: SlotScore[] = [];
  for (const slot of topTier) {
    if (picked.length >= limit) break;
    if (picked.every((p) => Math.abs(p.minutes - slot.minutes) >= 120)) picked.push(slot);
  }
  return picked
    .sort((a, b) => a.minutes - b.minutes)
    .map(({ start, hostWall, goodCount, edgeCount, nightCount }) => ({
      start,
      hostWall,
      goodCount,
      edgeCount,
      nightCount,
    }));
}

/** A stretch of the host's day, in minutes after 00:00, that a meeting can sit anywhere inside. */
export interface MeetingWindow {
  startMinutes: number;
  endMinutes: number;
}

/**
 * The stretches of the host's day in which a meeting of `durationMinutes` keeps every
 * participant inside reasonable hours from start to finish. Each window runs from its
 * earliest possible start to the end of its latest possible meeting.
 */
export function findMeetingWindows(
  hostDate: Pick<WallTime, "year" | "month" | "day">,
  hostTimeZone: string,
  participantTimeZones: string[],
  durationMinutes: number
): MeetingWindow[] {
  const zones = Array.from(new Set(participantTimeZones));
  if (zones.length === 0) return [];
  const windows: MeetingWindow[] = [];
  let open: MeetingWindow | null = null;
  for (const slot of scoreSlots(hostDate, hostTimeZone, zones, durationMinutes)) {
    const fits = slot.goodCount === zones.length;
    if (fits && open && slot.minutes === open.endMinutes - durationMinutes + SLOT_STEP_MINUTES) {
      open.endMinutes = slot.minutes + durationMinutes;
    } else if (fits) {
      open = { startMinutes: slot.minutes, endMinutes: slot.minutes + durationMinutes };
      windows.push(open);
    } else {
      open = null;
    }
  }
  return windows;
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
