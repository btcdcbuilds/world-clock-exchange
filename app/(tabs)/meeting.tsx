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
  type NativeScrollEvent,
  type NativeSyntheticEvent,
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
  findMeetingWindows,
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
  SLOT_STEP_MINUTES,
  suggestMeetingTimes,
  zonedWallTimeToUtc,
  type HourStatus,
  type WallTime,
} from "@/lib/meeting-utils";

const LOCAL_ID = "__local__";
const DURATIONS = [15, 30, 45, 60, 90, 120];
const DATE_RANGE_DAYS = 90;
const DATE_CHIP_WIDTH = 58;
const DATE_CHIP_GAP = 6;

// Timeline geometry: one hour is HOUR_PX wide and the timeline snaps every 15 minutes.
const HOUR_PX = 72;
const STEP_PX = (HOUR_PX * SLOT_STEP_MINUTES) / 60;
const LAST_STEP = (24 * 60) / SLOT_STEP_MINUTES - 1; // 23:45
const AXIS_H = 32;
const LABEL_H = 24;
const STRIP_H = 36;
const ROW_GAP = 8;
const ROW_H = LABEL_H + STRIP_H + ROW_GAP;
/** The meeting bar's left edge sits this far across the timeline. */
const ANCHOR_RATIO = 0.3;

/**
 * Shared settings for the sideways strips (dates, durations, suggestions, timeline).
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

interface Participant {
  key: string;
  city: string;
  timeZone: string;
  isYou: boolean;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** "15m", "1h", "1.5h": short enough for all six duration chips to fit across a phone. */
function formatDurationShort(minutes: number): string {
  return minutes < 60 ? `${minutes}m` : `${minutes / 60}h`;
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
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState<CalendarDate>(() => {
    const now = getWallTime(new Date(), deviceTimeZone);
    return { year: now.year, month: now.month, day: now.day };
  });
  // Minutes after 00:00 on `date` in the phone's own time zone. While dragging, the
  // timeline's scroll position leads and this follows it one 15 minute step at a time.
  const [startMinutes, setStartMinutes] = useState(() => {
    const now = getWallTime(new Date(), deviceTimeZone);
    return Math.min((now.hour + 1) * 60, 23 * 60);
  });
  const [notice, setNotice] = useState<string | null>(null);
  const [timelineWidth, setTimelineWidth] = useState(0);

  const exportViewRef = useRef<View>(null);
  const timelineRef = useRef<ScrollView>(null);
  const dateScrollRef = useRef<ScrollView>(null);
  const dateScrollX = useRef(0);
  const dateViewportWidth = useRef(0);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelinePlaced = useRef(false);
  const lastStep = useRef(-1);
  const userScrolling = useRef(false);

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

  // You first (unless one of your cities already is your time zone), then your saved cities.
  const participants: Participant[] = useMemo(() => {
    const list: Participant[] = zones.map((z) => ({
      key: z.id,
      city: z.city,
      timeZone: z.timezone,
      isYou: z.timezone === deviceTimeZone,
    }));
    if (!list.some((p) => p.isYou)) {
      list.unshift({
        key: LOCAL_ID,
        city: `You · ${cityFromTimeZone(deviceTimeZone)}`,
        timeZone: deviceTimeZone,
        isYou: true,
      });
    }
    return list.sort((a, b) => Number(b.isYou) - Number(a.isYou));
  }, [zones, deviceTimeZone]);

  const start = useMemo(
    () =>
      zonedWallTimeToUtc(
        { ...date, hour: Math.floor(startMinutes / 60), minute: startMinutes % 60 },
        deviceTimeZone
      ),
    [date, startMinutes, deviceTimeZone]
  );
  const end = useMemo(() => new Date(start.getTime() + duration * 60000), [start, duration]);

  const rows = participants.map((p) => {
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
  });

  const timeZoneList = useMemo(() => participants.map((p) => p.timeZone), [participants]);
  const suggestions = useMemo(
    () => suggestMeetingTimes(date, deviceTimeZone, timeZoneList, duration),
    [date, deviceTimeZone, timeZoneList, duration]
  );
  const windows = useMemo(
    () => findMeetingWindows(date, deviceTimeZone, timeZoneList, duration),
    [date, deviceTimeZone, timeZoneList, duration]
  );

  // Each person's local hour at the start of each of your hours that day
  const grid = useMemo(() => {
    const hourStarts = Array.from({ length: 24 }, (_, h) =>
      zonedWallTimeToUtc({ ...date, hour: h, minute: 0 }, deviceTimeZone)
    );
    return participants.map((p) =>
      hourStarts.map((instant) => {
        const local = getWallTime(instant, p.timeZone);
        return { local, status: getHourStatus(local.hour) };
      })
    );
  }, [participants, date, deviceTimeZone]);

  const dateOptions = useMemo(() => {
    const today = getWallTime(new Date(), deviceTimeZone);
    return Array.from({ length: DATE_RANGE_DAYS }, (_, i) => addDays(today, i));
  }, [deviceTimeZone]);
  const dateIndex = dayDifference(dateOptions[0], date);

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

  const tap = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const showNotice = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 2500);
  };

  // ----- Timeline: dragging it sideways sets the start time -----
  const anchor = Math.round(timelineWidth * ANCHOR_RATIO);

  /** Glide the timeline so the meeting starts at `minutes` (a suggestion or a tapped hour). */
  const moveTo = (minutes: number) => {
    const step = Math.max(0, Math.min(LAST_STEP, Math.round(minutes / SLOT_STEP_MINUTES)));
    userScrolling.current = false;
    timelineRef.current?.scrollTo({ x: step * STEP_PX, animated: true });
  };

  const onTimelineScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!timelinePlaced.current) return;
    const step = Math.max(0, Math.min(LAST_STEP, Math.round(e.nativeEvent.contentOffset.x / STEP_PX)));
    if (step === lastStep.current) return;
    lastStep.current = step;
    setStartMinutes(step * SLOT_STEP_MINUTES);
    if (userScrolling.current && Platform.OS !== "web") Haptics.selectionAsync();
  };

  // Once its content is laid out, open the timeline on the best suggested time
  // (or the next whole hour when nothing suits anyone).
  const placeTimeline = () => {
    if (timelinePlaced.current) return;
    const best = suggestions[0];
    const minutes = best ? best.hostWall.hour * 60 + best.hostWall.minute : startMinutes;
    const step = Math.round(minutes / SLOT_STEP_MINUTES);
    setStartMinutes(step * SLOT_STEP_MINUTES);
    timelineRef.current?.scrollTo({ x: step * STEP_PX, animated: false });
    lastStep.current = step;
    timelinePlaced.current = true;
  };

  const summaryText = () => {
    const lines = [
      title.trim() || "Meeting",
      `${formatWallDate(date, settings.dateFormat)} · ${formatDuration(duration)}`,
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
    status === "good" ? colors.success : status === "edge" ? colors.warning : colors.muted;
  const cellBackground = (status: HourStatus) =>
    status === "good" ? `${colors.success}40` : status === "edge" ? `${colors.warning}33` : colors.background;

  // The hour strips change only with the day, the cities or the settings, never while dragging.
  const timelineContent = useMemo(
    () => (
      <View>
        <View style={{ height: AXIS_H, width: 24 * HOUR_PX }}>
          {windows.map((w) => (
            <View
              key={w.startMinutes}
              style={{
                position: "absolute",
                left: (w.startMinutes / 60) * HOUR_PX,
                width: ((w.endMinutes - w.startMinutes) / 60) * HOUR_PX - 2,
                top: 20,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.success,
              }}
            />
          ))}
        </View>
        {grid.map((cells, rowIndex) => (
          <View
            key={participants[rowIndex].key}
            style={{ flexDirection: "row", height: STRIP_H, marginTop: LABEL_H, marginBottom: ROW_GAP }}
          >
            {cells.map((cell, h) => {
              const hourLabel =
                settings.timeFormat === "24h"
                  ? String(cell.local.hour)
                  : String(cell.local.hour % 12 === 0 ? 12 : cell.local.hour % 12);
              return (
                <TouchableOpacity
                  key={h}
                  onPress={() => {
                    tap();
                    moveTo(h * 60);
                  }}
                  activeOpacity={0.6}
                  accessibilityLabel={`${participants[rowIndex].city} ${formatClock(
                    cell.local.hour,
                    cell.local.minute,
                    settings.timeFormat
                  )}`}
                  style={{
                    width: HOUR_PX - 2,
                    height: STRIP_H,
                    marginRight: 2,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: cellBackground(cell.status),
                  }}
                >
                  {cell.local.hour === 0 && cell.local.minute === 0 ? (
                    <Text style={{ fontSize: 11, fontWeight: "800", color: colors.foreground }}>
                      {getWeekday(cell.local).toUpperCase()} {cell.local.day}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                      {hourLabel}
                      {cell.local.minute ? (
                        <Text style={{ fontSize: 10 }}>:{String(cell.local.minute).padStart(2, "0")}</Text>
                      ) : null}
                      {settings.timeFormat === "12h" ? (
                        <Text style={{ fontSize: 10, color: colors.muted }}>{cell.local.hour < 12 ? " am" : " pm"}</Text>
                      ) : null}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    ),
    // tap, moveTo and cellBackground only read refs and colors, which are listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grid, windows, participants, settings.timeFormat, colors]
  );

  const card = {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  } as const;

  const sectionLabel = (text: string) => (
    <Text style={{ fontSize: 12, fontWeight: "700", letterSpacing: 0.6, color: colors.muted, marginBottom: 8 }}>
      {text}
    </Text>
  );

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

  const bandWidth = (duration / 60) * HOUR_PX - 2;

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground, marginBottom: 12 }}>
          Plan a Meeting
        </Text>

        {/* Date */}
        <ScrollView
          ref={dateScrollRef}
          {...STRIP_SCROLL_PROPS}
          style={{ marginBottom: 12 }}
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
                  backgroundColor: selected ? colors.primary : colors.surface,
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

        {/* Duration */}
        {/* All six fit across the screen, so none hides past the edge. */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
          {DURATIONS.map((d) => {
            const selected = duration === d;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => {
                  tap();
                  setDuration(d);
                }}
                accessibilityLabel={`${formatDuration(d)} meeting`}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 9,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : colors.surface,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "700", color: selected ? "#FFFFFF" : colors.foreground }}>
                  {formatDurationShort(d)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Suggestions */}
        {participants.length > 1 && (
          <View style={{ marginBottom: 14 }}>
            {sectionLabel("SUGGESTED TIMES")}
            {suggestions.length === 0 ? (
              <Text style={{ fontSize: 14, color: colors.muted }}>
                No time this day keeps anyone between 8am and 9pm. Try a shorter meeting or another day.
              </Text>
            ) : (
              <ScrollView {...STRIP_SCROLL_PROPS}>
                {suggestions.map((s) => {
                  const minutes = s.hostWall.hour * 60 + s.hostWall.minute;
                  const selected = minutes === startMinutes;
                  const everyone = s.goodCount === participants.length;
                  return (
                    <TouchableOpacity
                      key={s.start.toISOString()}
                      onPress={() => {
                        tap();
                        moveTo(minutes);
                      }}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 12,
                        marginRight: 8,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? `${colors.primary}22` : colors.surface,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground }}>
                        {formatClock(s.hostWall.hour, s.hostWall.minute, settings.timeFormat)}
                      </Text>
                      <Text
                        style={{ fontSize: 12, fontWeight: "600", color: everyone ? colors.success : colors.muted }}
                      >
                        {everyone ? "Good for everyone" : `Good for ${s.goodCount} of ${participants.length}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

        {/* Timeline: drag sideways to set the time. This card is also what "Share as image" saves. */}
        <View ref={exportViewRef} collapsable={false} style={[card, { paddingHorizontal: 0, paddingBottom: 10 }]}>
          <View
            style={{
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: colors.foreground }} numberOfLines={1}>
                {title.trim() || "Meeting"}
              </Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {formatWallDate(date, settings.dateFormat)}
                {settings.dateFormat === "YYYY-MM-DD" ? "" : ` ${date.year}`} · {formatDuration(duration)}
                {isWeekend(date) ? (
                  <Text style={{ color: colors.warning, fontWeight: "600" }}> · Weekend</Text>
                ) : null}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/add-timezone")} accessibilityLabel="Add a city" hitSlop={10}>
              <IconSymbol name="plus.circle.fill" size={26} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 6 }} onLayout={(e) => setTimelineWidth(Math.round(e.nativeEvent.layout.width))}>
            {timelineWidth > 0 && (
              <ScrollView
                ref={timelineRef}
                {...STRIP_SCROLL_PROPS}
                accessibilityLabel="Meeting time. Drag sideways to change it."
                snapToInterval={STEP_PX}
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={onTimelineScroll}
                onScrollBeginDrag={() => {
                  userScrolling.current = true;
                }}
                onMomentumScrollEnd={() => {
                  userScrolling.current = false;
                }}
                onContentSizeChange={placeTimeline}
                contentContainerStyle={{ paddingLeft: anchor, paddingRight: timelineWidth - anchor - STEP_PX }}
              >
                {timelineContent}
              </ScrollView>
            )}

            {/* Fixed layer on top of the strips: the meeting bar and each city's meeting time */}
            <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
              {windows.length > 0 && (
                <Text
                  style={{
                    position: "absolute",
                    left: 14,
                    top: 0,
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 0.4,
                    color: colors.success,
                  }}
                >
                  GREEN BAR = GOOD FOR EVERYONE
                </Text>
              )}
              {rows.map((r, i) => {
                const top = AXIS_H + i * ROW_H;
                return (
                  <View key={r.key}>
                    <View
                      style={{
                        position: "absolute",
                        left: 14,
                        right: 14,
                        top,
                        height: LABEL_H,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1, marginRight: 8 }}>
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            marginRight: 6,
                            backgroundColor: statusColor(r.status),
                          }}
                        />
                        <Text
                          numberOfLines={1}
                          style={{
                            flexShrink: 1,
                            fontSize: 13,
                            fontWeight: r.isYou ? "800" : "600",
                            color: r.isYou ? colors.primary : colors.foreground,
                          }}
                        >
                          {r.city}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
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
                        <Text style={{ fontSize: 14, fontWeight: "800", color: colors.foreground }}>
                          {formatClock(r.localStart.hour, r.localStart.minute, settings.timeFormat)} –{" "}
                          {formatClock(r.localEnd.hour, r.localEnd.minute, settings.timeFormat)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        position: "absolute",
                        left: anchor - 2,
                        width: bandWidth + 4,
                        top: top + LABEL_H - 2,
                        height: STRIP_H + 4,
                        borderRadius: 10,
                        borderWidth: 2.5,
                        borderColor: colors.primary,
                        backgroundColor: `${colors.primary}1F`,
                      }}
                    />
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 14, marginTop: 2, paddingHorizontal: 14, flexWrap: "wrap" }}>
            <Legend color={`${colors.success}40`} label="8am–9pm" textColor={colors.muted} />
            <Legend color={`${colors.warning}33`} label="7–8am, 9–10pm" textColor={colors.muted} />
            <Legend color={colors.background} label="Night" textColor={colors.muted} border={colors.border} />
          </View>
          <Text style={{ fontSize: 12, color: colors.muted, paddingHorizontal: 14, marginTop: 6 }}>
            Drag the hours sideways to move the meeting, or tap an hour.
          </Text>
        </View>

        {/* Title and actions */}
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
            marginBottom: 12,
          }}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ActionButton icon="square.and.arrow.up" label="Share times" onPress={handleShare} primary colors={colors} />
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
