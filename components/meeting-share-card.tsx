import { forwardRef } from "react";
import { Text, View } from "react-native";

import type { HourStatus } from "@/lib/meeting-utils";

export interface ShareCardRow {
  key: string;
  city: string;
  /** "7:00 – 8:00 PM" */
  timeRange: string;
  /** "Fri, Oct 2" */
  localDate: string;
  /** +1 / -1 when the city is on a different day from the meeting's own date */
  dayShift: number;
  /** "Morning", "Evening", "Night"… for the local start time */
  timeOfDay: string;
  status: HourStatus;
}

// The card is always light with fixed colors, so the image reads well in any chat app,
// whatever theme the sender uses.
const INK = "#11181C";
const MUTED = "#687076";
const LINE = "#E6E8EB";
const BRAND = "#0A7EA4";
const STATUS: Record<HourStatus, string> = { good: "#1E9E5A", edge: "#C98A00", night: "#8A9199" };

/** The image people receive from "Share image": the meeting and every city's local time, large. */
export const MeetingShareCard = forwardRef<
  View,
  { title: string; dateLabel: string; durationLabel: string; rows: ShareCardRow[] }
>(function MeetingShareCard({ title, dateLabel, durationLabel, rows }, ref) {
  return (
    <View ref={ref} collapsable={false} style={{ backgroundColor: "#FFFFFF", padding: 22, borderRadius: 20 }}>
      <Text style={{ fontSize: 12, fontWeight: "800", letterSpacing: 1, color: BRAND }}>MEETING TIMES</Text>
      <Text style={{ fontSize: 26, fontWeight: "800", color: INK, marginTop: 4 }}>{title}</Text>
      <Text style={{ fontSize: 15, color: MUTED, marginTop: 2, marginBottom: 12 }}>
        {dateLabel} · {durationLabel}
      </Text>
      {rows.map((r) => (
        <View
          key={r.key}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: LINE,
          }}
        >
          <View style={{ width: 5, alignSelf: "stretch", borderRadius: 3, backgroundColor: STATUS[r.status], marginRight: 12 }} />
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: INK }} numberOfLines={1}>
              {r.city}
            </Text>
            <Text style={{ fontSize: 13, color: MUTED, marginTop: 1 }}>
              {r.localDate}
              {r.dayShift > 0 ? " · next day" : r.dayShift < 0 ? " · day before" : ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 19, fontWeight: "800", color: INK }}>{r.timeRange}</Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: STATUS[r.status], marginTop: 1 }}>{r.timeOfDay}</Text>
          </View>
        </View>
      ))}
      <Text style={{ fontSize: 11, color: MUTED, marginTop: 12, textAlign: "center" }}>
        Each time is local to that city · TimeZone Exchange
      </Text>
    </View>
  );
});
