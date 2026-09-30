import { describe, expect, it } from "vitest";
import {
  addDays,
  buildGoogleCalendarUrl,
  dayDifference,
  formatOffset,
  getHourStatus,
  getMeetingStatus,
  getOffsetMinutes,
  getWallTime,
  isWeekend,
  suggestMeetingTimes,
  zonedWallTimeToUtc,
} from "../lib/meeting-utils";

describe("getOffsetMinutes", () => {
  it("returns fixed offsets", () => {
    const d = new Date("2026-01-15T12:00:00Z");
    expect(getOffsetMinutes("Asia/Tokyo", d)).toBe(540);
    expect(getOffsetMinutes("Asia/Kolkata", d)).toBe(330);
    expect(getOffsetMinutes("Asia/Kathmandu", d)).toBe(345);
    expect(getOffsetMinutes("UTC", d)).toBe(0);
  });

  it("follows daylight saving time", () => {
    expect(getOffsetMinutes("America/New_York", new Date("2026-01-15T12:00:00Z"))).toBe(-300);
    expect(getOffsetMinutes("America/New_York", new Date("2026-07-15T12:00:00Z"))).toBe(-240);
    expect(getOffsetMinutes("Europe/London", new Date("2026-07-15T12:00:00Z"))).toBe(60);
    expect(getOffsetMinutes("Australia/Sydney", new Date("2026-01-15T12:00:00Z"))).toBe(660);
  });
});

describe("formatOffset", () => {
  it("formats offsets", () => {
    expect(formatOffset(0)).toBe("GMT");
    expect(formatOffset(330)).toBe("GMT+5:30");
    expect(formatOffset(-240)).toBe("GMT-4");
    expect(formatOffset(-570)).toBe("GMT-9:30");
  });
});

describe("zonedWallTimeToUtc", () => {
  it("converts a host wall time to the correct instant", () => {
    const d = zonedWallTimeToUtc({ year: 2026, month: 3, day: 10, hour: 9, minute: 0 }, "Asia/Tokyo");
    expect(d.toISOString()).toBe("2026-03-10T00:00:00.000Z");
  });

  it("round-trips through getWallTime in many zones", () => {
    const zones = ["America/Los_Angeles", "Europe/Berlin", "Asia/Kolkata", "Australia/Adelaide", "Pacific/Auckland"];
    for (const tz of zones) {
      const wall = { year: 2026, month: 7, day: 4, hour: 14, minute: 30 };
      expect(getWallTime(zonedWallTimeToUtc(wall, tz), tz)).toEqual(wall);
    }
  });

  it("resolves a spring-forward gap to just after the gap", () => {
    // 2026-03-08 02:30 does not exist in New York
    const d = zonedWallTimeToUtc({ year: 2026, month: 3, day: 8, hour: 2, minute: 30 }, "America/New_York");
    expect(d.toISOString()).toBe("2026-03-08T07:30:00.000Z"); // 03:30 EDT
  });
});

describe("calendar helpers", () => {
  it("adds days across month and year boundaries", () => {
    const w = { year: 2026, month: 12, day: 31, hour: 10, minute: 0 };
    expect(addDays(w, 1)).toEqual({ year: 2027, month: 1, day: 1, hour: 10, minute: 0 });
    expect(dayDifference(w, addDays(w, -3))).toBe(-3);
  });
});

describe("isWeekend", () => {
  it("detects Saturday and Sunday", () => {
    expect(isWeekend({ year: 2026, month: 9, day: 26 })).toBe(true); // Sat
    expect(isWeekend({ year: 2026, month: 9, day: 27 })).toBe(true); // Sun
    expect(isWeekend({ year: 2026, month: 9, day: 28 })).toBe(false); // Mon
  });
});

describe("status", () => {
  it("classifies hours", () => {
    expect(getHourStatus(9)).toBe("work");
    expect(getHourStatus(17)).toBe("work");
    expect(getHourStatus(18)).toBe("edge");
    expect(getHourStatus(7)).toBe("edge");
    expect(getHourStatus(3)).toBe("night");
  });

  it("classifies a meeting per participant", () => {
    // 09:00 New York (EST) = 14:00 London = 23:00 Tokyo
    const start = new Date("2026-01-15T14:00:00Z");
    const end = new Date("2026-01-15T15:00:00Z");
    expect(getMeetingStatus(start, end, "America/New_York")).toBe("work");
    expect(getMeetingStatus(start, end, "Europe/London")).toBe("work");
    expect(getMeetingStatus(start, end, "Asia/Tokyo")).toBe("night");
  });

  it("treats a meeting ending exactly at 18:00 as working hours", () => {
    const start = new Date("2026-01-15T17:00:00Z");
    const end = new Date("2026-01-15T18:00:00Z");
    expect(getMeetingStatus(start, end, "UTC")).toBe("work");
  });
});

describe("suggestMeetingTimes", () => {
  it("finds the overlap between London and New York", () => {
    const slots = suggestMeetingTimes(
      { year: 2026, month: 1, day: 15 },
      "Europe/London",
      ["Europe/London", "America/New_York"],
      60
    );
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(slot.workCount).toBe(2);
      expect(slot.nightCount).toBe(0);
      // Overlap is 14:00-17:00 London (09:00-12:00 New York)
      expect(slot.hostWall.hour).toBeGreaterThanOrEqual(14);
      expect(slot.hostWall.hour).toBeLessThanOrEqual(17);
    }
  });

  it("never picks night for anyone when a better option exists", () => {
    const slots = suggestMeetingTimes(
      { year: 2026, month: 1, day: 15 },
      "America/Los_Angeles",
      ["America/Los_Angeles", "Europe/London", "Asia/Singapore"],
      30
    );
    expect(slots.length).toBe(3);
    // Results come back in chronological order
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].start.getTime()).toBeGreaterThan(slots[i - 1].start.getTime());
    }
  });

  it("returns nothing without participants", () => {
    expect(suggestMeetingTimes({ year: 2026, month: 1, day: 15 }, "UTC", [], 30)).toEqual([]);
  });

  it("never offers a time at which nobody is in working hours", () => {
    // Before the fix this offered 17:00 Bogota for 2 hours with 0 of 3 in working hours.
    const day = { year: 2026, month: 9, day: 30 };
    const zones = ["America/Bogota", "Asia/Tokyo", "America/New_York"];
    const slots = suggestMeetingTimes(day, "America/Bogota", zones, 120);
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(slot.workCount).toBeGreaterThanOrEqual(1);
    }
    expect(slots.some((s) => s.hostWall.hour === 17 && s.hostWall.minute === 0)).toBe(false);
  });

  it("never offers a time at which the host is outside working hours", () => {
    // The four saved test cities with the host in Bogota and a 2 hour meeting:
    // before the fix the first suggestion was 01:00 Bogota (host at night).
    const day = { year: 2026, month: 9, day: 30 };
    const zones = ["America/Bogota", "Asia/Tokyo", "Europe/London", "Australia/Sydney"];
    const slots = suggestMeetingTimes(day, "America/Bogota", zones, 120);
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      const end = new Date(slot.start.getTime() + 120 * 60000);
      expect(getMeetingStatus(slot.start, end, "America/Bogota")).not.toBe("night");
      expect(slot.workCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("returns nothing when no time meets both rules", () => {
    // A 10 hour meeting cannot fit inside anyone's 09:00 to 18:00 working hours.
    const day = { year: 2026, month: 9, day: 30 };
    expect(
      suggestMeetingTimes(day, "Europe/London", ["Europe/London", "Asia/Tokyo"], 600)
    ).toEqual([]);
  });
});

describe("buildGoogleCalendarUrl", () => {
  it("encodes title and UTC dates", () => {
    const url = buildGoogleCalendarUrl(
      "Team sync",
      new Date("2026-01-15T14:00:00Z"),
      new Date("2026-01-15T15:00:00Z"),
      "Hi"
    );
    expect(url).toBe(
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Team%20sync&dates=20260115T140000Z/20260115T150000Z&details=Hi"
    );
  });
});
