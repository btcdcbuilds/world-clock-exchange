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
  findMeetingWindows,
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
    expect(getHourStatus(8)).toBe("good");
    expect(getHourStatus(18)).toBe("good");
    expect(getHourStatus(20)).toBe("good");
    expect(getHourStatus(21)).toBe("edge");
    expect(getHourStatus(7)).toBe("edge");
    expect(getHourStatus(22)).toBe("night");
    expect(getHourStatus(3)).toBe("night");
  });

  it("classifies a meeting per participant", () => {
    // 09:00 New York (EST) = 14:00 London = 23:00 Tokyo
    const start = new Date("2026-01-15T14:00:00Z");
    const end = new Date("2026-01-15T15:00:00Z");
    expect(getMeetingStatus(start, end, "America/New_York")).toBe("good");
    expect(getMeetingStatus(start, end, "Europe/London")).toBe("good");
    expect(getMeetingStatus(start, end, "Asia/Tokyo")).toBe("night");
  });

  it("treats a meeting ending exactly at 21:00 as reasonable hours", () => {
    const start = new Date("2026-01-15T20:00:00Z");
    const end = new Date("2026-01-15T21:00:00Z");
    expect(getMeetingStatus(start, end, "UTC")).toBe("good");
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
      expect(slot.goodCount).toBe(2);
      expect(slot.nightCount).toBe(0);
      // Overlap is 13:00-21:00 London (08:00-16:00 New York), so a 1 hour start is 13:00-20:00
      expect(slot.hostWall.hour).toBeGreaterThanOrEqual(13);
      expect(slot.hostWall.hour).toBeLessThanOrEqual(20);
    }
    // Suggestions are real alternatives: at least two hours apart
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].start.getTime() - slots[i - 1].start.getTime()).toBeGreaterThanOrEqual(120 * 60000);
    }
  });

  it("never picks night for anyone when a better option exists", () => {
    const slots = suggestMeetingTimes(
      { year: 2026, month: 1, day: 15 },
      "America/Los_Angeles",
      ["America/Los_Angeles", "Europe/London", "Asia/Singapore"],
      30
    );
    expect(slots.length).toBeGreaterThan(0);
    // Every suggestion is in the same (best) tier
    for (const slot of slots) {
      expect(slot.nightCount).toBe(slots[0].nightCount);
      expect(slot.goodCount).toBe(slots[0].goodCount);
    }
    // Results come back in chronological order
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].start.getTime()).toBeGreaterThan(slots[i - 1].start.getTime());
    }
  });

  it("returns nothing without participants", () => {
    expect(suggestMeetingTimes({ year: 2026, month: 1, day: 15 }, "UTC", [], 30)).toEqual([]);
  });

  it("never offers a time at which nobody is in reasonable hours", () => {
    // Before the fix this offered 17:00 Bogota for 2 hours with 0 of 3 in working hours.
    const day = { year: 2026, month: 9, day: 30 };
    const zones = ["America/Bogota", "Asia/Tokyo", "America/New_York"];
    const slots = suggestMeetingTimes(day, "America/Bogota", zones, 120);
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(slot.goodCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("never offers a time at which the host is at night", () => {
    // The four saved test cities with the host in Bogota and a 2 hour meeting:
    // before the fix the first suggestion was 01:00 Bogota (host at night).
    const day = { year: 2026, month: 9, day: 30 };
    const zones = ["America/Bogota", "Asia/Tokyo", "Europe/London", "Australia/Sydney"];
    const slots = suggestMeetingTimes(day, "America/Bogota", zones, 120);
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      const end = new Date(slot.start.getTime() + 120 * 60000);
      expect(getMeetingStatus(slot.start, end, "America/Bogota")).not.toBe("night");
      expect(slot.goodCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("returns nothing when no time meets both rules", () => {
    // A 14 hour meeting cannot fit inside anyone's 08:00 to 21:00 reasonable hours.
    const day = { year: 2026, month: 9, day: 30 };
    expect(
      suggestMeetingTimes(day, "Europe/London", ["Europe/London", "Asia/Tokyo"], 840)
    ).toEqual([]);
  });
});

describe("suggestMeetingTimes tiers", () => {
  it("does not list weaker times next to one that suits everyone", () => {
    // Bogota, Bangkok and Tokyo on 30 Sep 2026: only around 20:00 Bogota suits all three.
    const slots = suggestMeetingTimes(
      { year: 2026, month: 9, day: 30 },
      "America/Bogota",
      ["America/Bogota", "Asia/Bangkok", "Asia/Tokyo"],
      60
    );
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) expect(slot.goodCount).toBe(3);
  });
});

describe("findMeetingWindows", () => {
  it("finds the stretch where London and New York are both in reasonable hours", () => {
    const windows = findMeetingWindows(
      { year: 2026, month: 1, day: 15 },
      "Europe/London",
      ["Europe/London", "America/New_York"],
      60
    );
    // 13:00 to 21:00 London = 08:00 to 16:00 New York
    expect(windows).toEqual([{ startMinutes: 13 * 60, endMinutes: 21 * 60 }]);
  });

  it("shrinks the window's starts as the meeting gets longer", () => {
    const windows = findMeetingWindows(
      { year: 2026, month: 1, day: 15 },
      "Europe/London",
      ["Europe/London", "America/New_York"],
      120
    );
    expect(windows).toEqual([{ startMinutes: 13 * 60, endMinutes: 21 * 60 }]);
  });

  it("returns nothing when there is no shared reasonable time", () => {
    // Bogota and Sydney share no hour where both are between 08:00 and 21:00 for 3 hours
    const windows = findMeetingWindows(
      { year: 2026, month: 9, day: 30 },
      "America/Bogota",
      ["America/Bogota", "Australia/Sydney", "Europe/London"],
      180
    );
    expect(windows).toEqual([]);
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
