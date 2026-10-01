import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  Share,
  Linking,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import type { AppSettings, Timezone } from "@/lib/types";
import { loadSettings, loadTimezones } from "@/lib/storage";
import {
  addDays,
  buildGoogleCalendarUrl,
  cityFromTimeZone,
  dayDifference,
  formatClock,
  formatOffset,
  formatWallDate,
  getDeviceTimeZone,
  getHourStatus,
  getMeetingStatus,
  getMonthName,
  getOffsetMinutes,
  getWallTime,
  getWeekday,
  isWeekend,
  suggestMeetingTimes,
  zonedWallTimeToUtc,
  type HourStatus,
  type WallTime,
} from "@/lib/meeting-utils";

const LOCAL_HOST_ID = "__local__";
const DURATIONS = [15, 30, 45, 60, 90, 120];
const DATE_RANGE_DAYS = 90;
const DATE_CHIP_WIDTH = 58;
const DATE_CHIP_GAP = 6;
const CELL_WIDTH = 40;
const LABEL_WIDTH = 92;
const LAST_START_MINUTES = 24 * 60 - 15;

/**
 * Shared settings for the sideways strips (host cities, dates, durations, hour grid).
 * On Android 12 and later a fast swipe back to the start of a strip could leave the edge
 * "stretch" effect stuck, and while it is stuck the strip treats the next taps as the start
 * of a drag, so the chips ignored them. Turning the edge effect off keeps every tap a tap.
 */
const STRIP_SCROLL_PROPS = {
  horizontal: true,
  showsHorizontalScrollIndicator: false,
  overScrollMode: "never",
  bounces: false,
} as const;

type CalendarDate = Pick<WallTime, "year" | "month" | "day">;

/** Keep a date inside the date strip (today to the strip's last day, host calendar). */
function clampToRange(d: CalendarDate, first: CalendarDate, last: CalendarDate): CalendarDate {
  if (dayDifference(first, d) < 0) return { year: first.year, month: first.month, day: first.day };
  if (dayDifference(d, last) < 0) return { year: last.year, month: last.month, day: last.day };
  return { year: d.year, month: d.month, day: d.day };
}

interface Participant {
  key: string;
  city: string;
  timeZone: string;
  isHost: boolean;
}

const STATUS_LABEL: Record<HourStatus, string> = {
  work: "Working hours",
  edge: "Early / late",
  night: "Outside hours",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export default function MeetingScreen() {
  const colors = useColors();
  const deviceTimeZone = useMemo(() => getDeviceTimeZone(), []);

  const [zones, setZones] = useState<Timezone[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState<Pick<AppSettings, "timeFormat" | "dateFormat">>({
    timeFormat: "12h",
    dateFormat: "MM/DD/YYYY",
  });
  const [hostId, setHostId] = useState<string>(LOCAL_HOST_ID);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  // The chosen day and start time are one piece of state, so quick repeated presses of the
  // arrows and the ± buttons each build on the previous press (none are lost), and a roll
  // over midnight changes the day and the time together.
  const [when, setWhen] = useState<{ date: CalendarDate; startMinutes: number }>(() => {
    const now = getWallTime(new Date(), deviceTimeZone);
    return {
      date: { year: now.year, month: now.month, day: now.day },
      startMinutes: Math.min((now.hour + 1) * 60, 23 * 60),
    };
  });
  const { date, startMinutes } = when;
  const setDate = useCallback((d: CalendarDate) => {
    setWhen((w) => ({ ...w, date: { year: d.year, month: d.month, day: d.day } }));
  }, []);
  const setStartMinutes = useCallback((minutes: number) => {
    setWhen((w) => ({ ...w, startMinutes: minutes }));
  }, []);
  const [notice, setNotice] = useState<string | null>(null);

  const exportViewRef = useRef<View>(null);
  const hostScrollRef = useRef<ScrollView>(null);
  const gridScrollRef = useRef<ScrollView>(null);
  const dateScrollRef = useRef<ScrollView>(null);
  const dateScrollX = useRef(0);
  const dateViewportWidth = useRef(0);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([loadTimezones(), loadSettings()]).then(([savedZones, savedSettings]) => {
        if (!active) return;
        setZones(savedZones);
        setSettings(savedSettings);
        setLoaded(true);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const hostZone = zones.find((z) => z.id === hostId);
  // The time zone of the last host that still existed. If the host city is removed on World
  // Clock, the chosen day and time are still read in that city's time zone until the effect
  // below hands over to My time, so the meeting never jumps, not even for one frame.
  const lastHostTimeZone = useRef(deviceTimeZone);
  const hostTimeZone =
    hostZone?.timezone ?? (hostId === LOCAL_HOST_ID ? deviceTimeZone : lastHostTimeZone.current);
  useEffect(() => {
    lastHostTimeZone.current = hostTimeZone;
  }, [hostTimeZone]);

  // If the host city was removed on another tab, fall back to My time at the same moment:
  // re-express the chosen start in the phone's own calendar (as tapping a host chip does)
  // and bring the selected My time chip back into view.
  useEffect(() => {
    if (hostId === LOCAL_HOST_ID || zones.some((z) => z.id === hostId)) return;
    const removedTimeZone = lastHostTimeZone.current;
    setWhen((w) => {
      const instant = zonedWallTimeToUtc(
        { ...w.date, hour: Math.floor(w.startMinutes / 60), minute: w.startMinutes % 60 },
        removedTimeZone
      );
      const wall = getWallTime(instant, deviceTimeZone);
      return {
        date: { year: wall.year, month: wall.month, day: wall.day },
        startMinutes: wall.hour * 60 + wall.minute,
      };
    });
    setHostId(LOCAL_HOST_ID);
    hostScrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [zones, hostId, deviceTimeZone]);

  const participants: Participant[] = useMemo(() => {
    const list: Participant[] = zones.map((z) => ({
      key: z.id,
      city: z.city,
      timeZone: z.timezone,
      isHost: z.id === hostId,
    }));
    // Always include the user themselves unless one of their cities already covers it
    if (!zones.some((z) => z.timezone === deviceTimeZone)) {
      list.unshift({
        key: LOCAL_HOST_ID,
        city: `You · ${cityFromTimeZone(deviceTimeZone)}`,
        timeZone: deviceTimeZone,
        isHost: hostId === LOCAL_HOST_ID,
      });
    }
    // Host always first
    return list.sort((a, b) => Number(b.isHost) - Number(a.isHost));
  }, [zones, hostId, deviceTimeZone]);

  const start = useMemo(
    () =>
      zonedWallTimeToUtc(
        { ...date, hour: Math.floor(startMinutes / 60), minute: startMinutes % 60 },
        hostTimeZone
      ),
    [date, startMinutes, hostTimeZone]
  );
  const end = useMemo(() => new Date(start.getTime() + duration * 60000), [start, duration]);
  const hostStartWall = getWallTime(start, hostTimeZone);

  const rows = useMemo(
    () =>
      participants.map((p) => {
        const localStart = getWallTime(start, p.timeZone);
        const localEnd = getWallTime(end, p.timeZone);
        return {
          ...p,
          localStart,
          localEnd,
          status: getMeetingStatus(start, end, p.timeZone),
          dayShift: dayDifference(date, localStart),
          offset: formatOffset(getOffsetMinutes(p.timeZone, start)),
        };
      }),
    [participants, start, end, date]
  );

  const suggestions = useMemo(
    () =>
      suggestMeetingTimes(
        date,
        hostTimeZone,
        participants.map((p) => p.timeZone),
        duration
      ),
    [date, hostTimeZone, participants, duration]
  );

  // Hour-by-hour grid: the host's day across the top, each participant's local hour in the cells
  const grid = useMemo(() => {
    const hourStarts = Array.from({ length: 24 }, (_, h) =>
      zonedWallTimeToUtc({ ...date, hour: h, minute: 0 }, hostTimeZone)
    );
    return participants.map((p) =>
      hourStarts.map((instant) => {
        const local = getWallTime(instant, p.timeZone);
        return { local, status: getHourStatus(local.hour), dayShift: dayDifference(date, local) };
      })
    );
  }, [participants, date, hostTimeZone]);

  const dateOptions = useMemo(() => {
    const today = getWallTime(new Date(), hostTimeZone);
    return Array.from({ length: DATE_RANGE_DAYS }, (_, i) => addDays(today, i));
  }, [hostTimeZone]);
  const firstDay = dateOptions[0];
  const lastDay = dateOptions[dateOptions.length - 1];
  const isFirstDay = dayDifference(firstDay, date) <= 0;
  const isLastDay = dayDifference(date, lastDay) <= 0;
  const dateIndex = dayDifference(firstDay, date);

  // The date never leaves the strip (for example after switching the host city).
  useEffect(() => {
    const clamped = clampToRange(date, firstDay, lastDay);
    if (dayDifference(date, clamped) !== 0) setDate(clamped);
  }, [date, firstDay, lastDay, setDate]);

  // Scroll the date strip so the selected day's chip is visible whenever the date changes.
  const revealDateChip = useCallback((index: number, animated: boolean) => {
    const width = dateViewportWidth.current;
    const left = index * (DATE_CHIP_WIDTH + DATE_CHIP_GAP);
    const right = left + DATE_CHIP_WIDTH;
    const visibleFrom = dateScrollX.current;
    if (width > 0 && left >= visibleFrom && right <= visibleFrom + width) return;
    const x = Math.max(0, left - Math.max(0, (width - DATE_CHIP_WIDTH) / 2));
    dateScrollRef.current?.scrollTo({ x, animated });
  }, []);

  useEffect(() => {
    if (dateIndex >= 0 && dateIndex < DATE_RANGE_DAYS) revealDateChip(dateIndex, true);
  }, [dateIndex, loaded, revealDateChip]);

  const selectedHour = Math.floor(startMinutes / 60);
  const lastSelectedHour = Math.floor((startMinutes + duration - 1) / 60);

  useEffect(() => {
    gridScrollRef.current?.scrollTo({
      x: Math.max(0, (selectedHour - 3) * CELL_WIDTH),
      animated: true,
    });
  }, [selectedHour, loaded]);

  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2500);
  };

  const selectHost = (id: string) => {
    tap();
    // Keep the same instant but re-express it in the new host's calendar
    const newTz = zones.find((z) => z.id === id)?.timezone ?? deviceTimeZone;
    const wall = getWallTime(start, newTz);
    setHostId(id);
    setWhen({
      date: { year: wall.year, month: wall.month, day: wall.day },
      startMinutes: wall.hour * 60 + wall.minute,
    });
  };

  /**
   * Move the start time by `delta` minutes, rolling over midnight into the next or previous
   * day, but never before 00:00 on the strip's first day (today) or after 23:45 on its last day.
   * Built on the latest state, so presses made before the screen redraws are not lost.
   */
  const shiftTime = (delta: number) => {
    const atStart = isFirstDay && startMinutes + delta < 0 && startMinutes === 0;
    const atEnd = isLastDay && startMinutes + delta >= 24 * 60 && startMinutes >= LAST_START_MINUTES;
    if (!atStart && !atEnd) tap();
    setWhen((w) => {
      const next = w.startMinutes + delta;
      if (next < 0) {
        const previous = clampToRange(addDays({ ...w.date, hour: 0, minute: 0 }, -1), firstDay, lastDay);
        // Already on the first day: stop at 00:00.
        if (dayDifference(previous, w.date) === 0) return w.startMinutes === 0 ? w : { ...w, startMinutes: 0 };
        return { date: previous, startMinutes: next + 24 * 60 };
      }
      if (next >= 24 * 60) {
        const following = clampToRange(addDays({ ...w.date, hour: 0, minute: 0 }, 1), firstDay, lastDay);
        // Already on the last day: stop at 23:45.
        if (dayDifference(w.date, following) === 0) {
          return w.startMinutes >= LAST_START_MINUTES ? w : { ...w, startMinutes: LAST_START_MINUTES };
        }
        return { date: following, startMinutes: next - 24 * 60 };
      }
      return { ...w, startMinutes: next };
    });
  };

  /**
   * Move the date one day back or forward, never outside the date strip
   * (today to today + 89 days in the host's calendar).
   */
  const shiftDay = (delta: number) => {
    if ((delta < 0 && isFirstDay) || (delta > 0 && isLastDay)) return;
    tap();
    setWhen((w) => {
      const next = clampToRange(addDays({ ...w.date, hour: 0, minute: 0 }, delta), firstDay, lastDay);
      return dayDifference(w.date, next) === 0 ? w : { ...w, date: next };
    });
  };

  const summaryText = () => {
    const lines = [
      title.trim() || "Meeting",
      `${formatWallDate(hostStartWall, settings.dateFormat)} · ${formatDuration(duration)} · set in ${hostZone?.city ?? cityFromTimeZone(deviceTimeZone)}`,
      "",
      ...rows.map(
        (r) =>
          `• ${r.city}: ${formatWallDate(r.localStart, settings.dateFormat)}, ${formatClock(
            r.localStart.hour,
            r.localStart.minute,
            settings.timeFormat
          )} – ${formatClock(r.localEnd.hour, r.localEnd.minute, settings.timeFormat)} (${r.offset})`
      ),
    ];
    return lines.join("\n");
  };

  const handleShare = async () => {
    tap();
    const message = summaryText();
    try {
      if (Platform.OS === "web") {
        const nav = typeof navigator !== "undefined" ? (navigator as any) : null;
        if (nav?.share) {
          await nav.share({ title: title.trim() || "Meeting", text: message });
          return;
        }
        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(message);
          showNotice("Meeting times copied to clipboard");
          return;
        }
        showNotice("Sharing isn't available in this browser");
        return;
      }
      await Share.share({ message, title: title.trim() || "Meeting" });
    } catch (error: any) {
      if (error?.name !== "AbortError") showNotice("Couldn't share meeting times");
    }
  };

  const handleCalendar = async () => {
    tap();
    const details = `Times for everyone:\n${rows
      .map(
        (r) =>
          `${r.city}: ${formatWallDate(r.localStart, settings.dateFormat)} ${formatClock(
            r.localStart.hour,
            r.localStart.minute,
            settings.timeFormat
          )}`
      )
      .join("\n")}`;
    const url = buildGoogleCalendarUrl(title.trim() || "Meeting", start, end, details);
    try {
      await Linking.openURL(url);
    } catch {
      showNotice("Couldn't open calendar");
    }
  };

  const handleExportImage = async () => {
    tap();
    try {
      const { captureAndShareView } = await import("@/lib/export-utils");
      await captureAndShareView(exportViewRef, "meeting-times.png");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const statusColor = (status: HourStatus) =>
    status === "work" ? colors.success : status === "edge" ? colors.warning : colors.muted;
  const cellBackground = (status: HourStatus) =>
    status === "work"
      ? `${colors.success}40`
      : status === "edge"
        ? `${colors.warning}33`
        : colors.background;

  const sectionLabel = (text: string) => (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.6,
        color: colors.muted,
        marginBottom: 8,
      }}
    >
      {text}
    </Text>
  );

  const chip = (label: string, selected: boolean, onPress: () => void, key?: string) => (
    <TouchableOpacity
      key={key ?? label}
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primary : colors.surface,
        marginRight: 8,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: selected ? "#FFFFFF" : colors.foreground,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const card = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  } as const;

  // Draw nothing until saved cities and settings are in, so the first frame
  // never shows the default 12-hour / US date format or a partial city list.
  if (!loaded) {
    return <ScreenContainer />;
  }

  if (zones.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <IconSymbol name="person.2.fill" size={64} color={colors.muted} />
        <Text className="text-2xl font-bold text-foreground mt-4 text-center">
          Who&apos;s in the meeting?
        </Text>
        <Text className="text-base text-muted text-center mt-2">
          Add the cities your attendees are in, then pick a time that works for everyone.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/add-timezone")}
          activeOpacity={0.8}
          style={{
            marginTop: 24,
            backgroundColor: colors.primary,
            paddingHorizontal: 22,
            paddingVertical: 12,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>Add a city</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground }}>
          Plan a Meeting
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 16 }}>
          Pick a time and see it instantly in every attendee&apos;s city.
        </Text>

        {/* Title */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Meeting title (optional)"
          placeholderTextColor={colors.muted}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.foreground,
            marginBottom: 14,
          }}
        />

        {/* Host timezone */}
        {sectionLabel("SET THE TIME IN")}
        <ScrollView ref={hostScrollRef} {...STRIP_SCROLL_PROPS} style={{ marginBottom: 16 }}>
          {chip(
            `My time · ${cityFromTimeZone(deviceTimeZone)}`,
            hostId === LOCAL_HOST_ID,
            () => selectHost(LOCAL_HOST_ID),
            LOCAL_HOST_ID
          )}
          {zones.map((z) => chip(z.city, hostId === z.id, () => selectHost(z.id), z.id))}
        </ScrollView>

        {/* Date */}
        <View style={card}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            {sectionLabel("DATE")}
            <View style={{ flexDirection: "row", gap: 6 }}>
              <StepButton
                icon="chevron.left"
                onPress={() => shiftDay(-1)}
                label="Previous day"
                disabled={isFirstDay}
                colors={colors}
              />
              <StepButton
                icon="chevron.right"
                onPress={() => shiftDay(1)}
                label="Next day"
                disabled={isLastDay}
                colors={colors}
              />
            </View>
          </View>
          <ScrollView
            ref={dateScrollRef}
            {...STRIP_SCROLL_PROPS}
            scrollEventThrottle={16}
            onScroll={(e) => {
              dateScrollX.current = e.nativeEvent.contentOffset.x;
            }}
            onLayout={(e) => {
              dateViewportWidth.current = e.nativeEvent.layout.width;
              if (dateIndex >= 0 && dateIndex < DATE_RANGE_DAYS) revealDateChip(dateIndex, false);
            }}
          >
            {dateOptions.map((d, i) => {
              const selected = d.year === date.year && d.month === date.month && d.day === date.day;
              return (
                <TouchableOpacity
                  key={`${d.year}-${d.month}-${d.day}`}
                  onPress={() => {
                    tap();
                    setDate({ year: d.year, month: d.month, day: d.day });
                  }}
                  activeOpacity={0.7}
                  style={{
                    width: DATE_CHIP_WIDTH,
                    paddingVertical: 8,
                    borderRadius: 12,
                    alignItems: "center",
                    marginRight: DATE_CHIP_GAP,
                    backgroundColor: selected ? colors.primary : colors.background,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", color: selected ? "#FFFFFF" : colors.muted }}>
                    {i === 0 ? "Today" : getWeekday(d)}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: selected ? "#FFFFFF" : colors.foreground }}>
                    {d.day}
                  </Text>
                  <Text style={{ fontSize: 11, color: selected ? "#FFFFFF" : colors.muted }}>
                    {getMonthName(d.month)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <Text style={{ fontSize: 13, color: colors.foreground, marginTop: 10, fontWeight: "600" }}>
            {formatWallDate(date, settings.dateFormat)}
            {settings.dateFormat === "YYYY-MM-DD" ? "" : ` ${date.year}`}
            {isWeekend(date) ? (
              <Text style={{ color: colors.warning, fontWeight: "600" }}>  · Weekend</Text>
            ) : null}
          </Text>
        </View>

        {/* Time & duration */}
        <View style={card}>
          {sectionLabel(`START TIME IN ${(hostZone?.city ?? "MY TIME").toUpperCase()}`)}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <StepButton icon="minus" onPress={() => shiftTime(-15)} label="15 minutes earlier" large colors={colors} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 34, fontWeight: "800", color: colors.foreground }}>
                {formatClock(hostStartWall.hour, hostStartWall.minute, settings.timeFormat)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {formatOffset(getOffsetMinutes(hostTimeZone, start))} · tap ± for 15 min steps
              </Text>
            </View>
            <StepButton icon="plus" onPress={() => shiftTime(15)} label="15 minutes later" large colors={colors} />
          </View>

          <View style={{ height: 14 }} />
          {sectionLabel("DURATION")}
          <ScrollView {...STRIP_SCROLL_PROPS}>
            {DURATIONS.map((d) => chip(formatDuration(d), duration === d, () => { tap(); setDuration(d); }))}
          </ScrollView>
        </View>

        {/* Suggestions */}
        {participants.length > 1 && (
          <View style={card}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 }}>
              <IconSymbol name="sparkles" size={16} color={colors.primary} />
              <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 0.6, color: colors.muted }}>
                BEST TIMES THIS DAY
              </Text>
            </View>
            {suggestions.length === 0 && (
              <Text style={{ fontSize: 14, color: colors.muted }}>
                No time on this day puts everyone in working hours. Try another day or a shorter
                meeting.
              </Text>
            )}
            {suggestions.map((s) => {
              const selected = s.start.getTime() === start.getTime();
              return (
                <TouchableOpacity
                  key={s.start.toISOString()}
                  onPress={() => {
                    tap();
                    setStartMinutes(s.hostWall.hour * 60 + s.hostWall.minute);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    marginBottom: 6,
                    backgroundColor: selected ? `${colors.primary}22` : colors.background,
                    borderWidth: 1,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
                    {formatClock(s.hostWall.hour, s.hostWall.minute, settings.timeFormat)}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>
                    <Text style={{ color: colors.success, fontWeight: "700" }}>{s.workCount}</Text>
                    {` of ${participants.length} in working hours`}
                    {s.nightCount > 0 ? ` · ${s.nightCount} outside` : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Timeline grid */}
        <View style={card}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            {sectionLabel("24-HOUR OVERVIEW · TAP AN HOUR")}
            <TouchableOpacity
              onPress={() => router.push("/add-timezone")}
              accessibilityLabel="Add a city"
              hitSlop={8}
            >
              <IconSymbol name="plus.circle.fill" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: LABEL_WIDTH }}>
              {participants.map((p) => (
                <View key={p.key} style={{ height: 38, justifyContent: "center", paddingRight: 6 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 13,
                      fontWeight: p.isHost ? "800" : "600",
                      color: p.isHost ? colors.primary : colors.foreground,
                    }}
                  >
                    {p.city}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.muted }}>
                    {formatOffset(getOffsetMinutes(p.timeZone, start))}
                  </Text>
                </View>
              ))}
            </View>
            <ScrollView ref={gridScrollRef} {...STRIP_SCROLL_PROPS}>
              <View>
                {grid.map((cells, rowIndex) => (
                  <View key={participants[rowIndex].key} style={{ flexDirection: "row", height: 38 }}>
                    {cells.map((cell, h) => {
                      const inMeeting = h >= selectedHour && h <= lastSelectedHour;
                      const isMidnight = cell.local.hour === 0;
                      const hourLabel =
                        settings.timeFormat === "24h"
                          ? String(cell.local.hour)
                          : String(cell.local.hour % 12 === 0 ? 12 : cell.local.hour % 12);
                      return (
                        <TouchableOpacity
                          key={h}
                          onPress={() => {
                            tap();
                            setStartMinutes(h * 60);
                          }}
                          activeOpacity={0.6}
                          accessibilityLabel={`${participants[rowIndex].city} ${formatClock(
                            cell.local.hour,
                            cell.local.minute,
                            settings.timeFormat
                          )}`}
                          style={{
                            width: CELL_WIDTH - 2,
                            height: 34,
                            marginRight: 2,
                            borderRadius: 6,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: cellBackground(cell.status),
                            borderWidth: inMeeting ? 2 : 0,
                            borderColor: colors.primary,
                          }}
                        >
                          {isMidnight ? (
                            <Text style={{ fontSize: 9, fontWeight: "800", color: colors.foreground }}>
                              {getWeekday(cell.local).toUpperCase()}
                              {"\n"}
                              {cell.local.day}
                            </Text>
                          ) : (
                            <>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: inMeeting ? "800" : "600",
                                  color: colors.foreground,
                                }}
                              >
                                {hourLabel}
                                {cell.local.minute ? (
                                  <Text style={{ fontSize: 9 }}>:{String(cell.local.minute).padStart(2, "0")}</Text>
                                ) : null}
                              </Text>
                              {settings.timeFormat === "12h" && (
                                <Text style={{ fontSize: 8, color: colors.muted }}>
                                  {cell.local.hour < 12 ? "am" : "pm"}
                                </Text>
                              )}
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={{ flexDirection: "row", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
            <Legend color={`${colors.success}40`} label="9am–6pm" textColor={colors.muted} />
            <Legend color={`${colors.warning}33`} label="7–9am, 6–10pm" textColor={colors.muted} />
            <Legend color={colors.background} label="Night" textColor={colors.muted} border={colors.border} />
          </View>
        </View>

        {/* Result card (exported as image) */}
        <View ref={exportViewRef} collapsable={false} style={[card, { backgroundColor: colors.background }]}>
          <Text style={{ fontSize: 20, fontWeight: "800", color: colors.foreground }}>
            {title.trim() || "Meeting"}
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2, marginBottom: 10 }}>
            {formatWallDate(hostStartWall, settings.dateFormat)} ·{" "}
            {formatClock(hostStartWall.hour, hostStartWall.minute, settings.timeFormat)} in{" "}
            {hostZone?.city ?? cityFromTimeZone(deviceTimeZone)} · {formatDuration(duration)}
          </Text>
          {rows.map((r, i) => (
            <View
              key={r.key}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: statusColor(r.status),
                  marginRight: 10,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }} numberOfLines={1}>
                  {r.city}
                </Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {isWeekend(r.localStart) ? "Weekend · " : ""}
                  {STATUS_LABEL[r.status]} · {r.offset}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>
                  {formatClock(r.localStart.hour, r.localStart.minute, settings.timeFormat)} –{" "}
                  {formatClock(r.localEnd.hour, r.localEnd.minute, settings.timeFormat)}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {formatWallDate(r.localStart, settings.dateFormat)}
                  </Text>
                  {r.dayShift !== 0 && (
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "800",
                        color: "#FFFFFF",
                        backgroundColor: r.dayShift > 0 ? colors.primary : colors.warning,
                        paddingHorizontal: 5,
                        paddingVertical: 1,
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      {r.dayShift > 0 ? `+${r.dayShift}` : r.dayShift} day
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton
            icon="square.and.arrow.up"
            label="Share times"
            onPress={handleShare}
            primary
            colors={colors}
          />
          <ActionButton icon="calendar" label="Add to calendar" onPress={handleCalendar} colors={colors} />
        </View>
        {Platform.OS !== "web" && (
          <View style={{ marginTop: 10 }}>
            <ActionButton icon="photo" label="Share as image" onPress={handleExportImage} colors={colors} />
          </View>
        )}
        {notice && (
          <Text style={{ textAlign: "center", color: colors.success, marginTop: 12, fontWeight: "600" }}>
            {notice}
          </Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function StepButton({
  icon,
  onPress,
  label,
  large,
  disabled,
  colors,
}: {
  icon: "chevron.left" | "chevron.right" | "minus" | "plus";
  onPress: () => void;
  label: string;
  large?: boolean;
  disabled?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  const size = large ? 48 : 32;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      activeOpacity={0.7}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <IconSymbol name={icon} size={large ? 24 : 18} color={colors.foreground} />
    </TouchableOpacity>
  );
}

function Legend({
  color,
  label,
  textColor,
  border,
}: {
  color: string;
  label: string;
  textColor: string;
  border?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          backgroundColor: color,
          borderWidth: border ? 1 : 0,
          borderColor: border,
        }}
      />
      <Text style={{ fontSize: 11, color: textColor }}>{label}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  primary,
  colors,
}: {
  icon: "square.and.arrow.up" | "calendar" | "photo";
  label: string;
  onPress: () => void;
  primary?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: primary ? colors.primary : colors.surface,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.border,
      }}
    >
      <IconSymbol name={icon} size={18} color={primary ? "#FFFFFF" : colors.foreground} />
      <Text style={{ fontSize: 15, fontWeight: "700", color: primary ? "#FFFFFF" : colors.foreground }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
