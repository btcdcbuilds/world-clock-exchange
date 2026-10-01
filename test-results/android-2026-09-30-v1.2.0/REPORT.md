# TimeZone Exchange 1.2.0 — Android emulator test report

**Result: PASS — 41 of 41 checks passed, 0 failed. In-app update tested live: PASS.**

| Item | Value |
|---|---|
| Date | Wednesday 30 September 2026, about 10:58 PM to 11:12 PM (emulator clock) |
| App | TimeZone Exchange version 1.2.0, package space.manus.world_clock_app.t20260102193011 |
| Build tested | Expo cloud build e9edbe74-fb03-48d9-a5c1-fc3e5376b6ec (preview profile, update channel "preview"), commit 614cf66 on branch feature/meeting-timeline-scrub |
| Download page | https://expo.dev/accounts/leigh2626/projects/world-clock-app/builds/e9edbe74-fb03-48d9-a5c1-fc3e5376b6ec |
| Direct APK file | https://expo.dev/artifacts/eas/QRzDUxgjrF1Gco0xYtUe8K-2BnyTFLJ1d9sC83XfwO8.apk |
| Update fingerprint | 0fdf544648c9f37e5e9fc79cbb8b4951a4e2cc93 (updates are only delivered to builds with this fingerprint) |
| Device | Android emulator Pixel_6_API_34 (Android 14, x86_64), serial emulator-5554 |
| How it was installed | Old copy uninstalled, the cloud APK installed fresh, app data cleared at the start of the run |
| How it was driven | scripts/android-e2e.sh over adb: taps every control by its label, reads the screen back, one screenshot per check |
| Unit tests | 40 passed, 1 skipped on purpose (vitest); TypeScript check clean |

## Every check

| Check | Result | What was tested | Measured |
|---|---|---|---|
| T01 | PASS | App opens from launcher without crashing, World Clock screen shows |  |
| T02 | PASS | First launch shows the empty state with a hint to tap + |  |
| T03 | PASS | + button opens Add Timezone |  |
| T04 | PASS | Back arrow on Add Timezone returns to World Clock |  |
| T05 | PASS | Search without accents ('sao') finds São Paulo |  |
| T06 | PASS | First tap on a result (keyboard open) adds the city and returns |  |
| T07 | PASS | Clear (x) button empties the search and shows the full list |  |
| T08 | PASS | Picking a city already on the list does not add a duplicate | Tokyo rows after adding it twice: 1 |
| T08b | PASS | Each city shows its time, date and exchange rate against USD | rows with a rate: 3 of 3 |
| T08c | PASS | Time zones tab lists named zones; searching 'mst' offers both Mountain Time and Arizona's MST |  |
| T08d | PASS | Adding a time zone by its short name (HKT) puts it on World Clock with its currency |  |
| T09 | PASS | Pull down to refresh works |  |
| T10 | PASS | Long-press → Cancel keeps the city |  |
| T11 | PASS | Meeting tab opens with suggestions and a timeline row for You and each city |  |
| T12 | PASS | Meeting opens on the best suggested time | first suggestion '7:00 AM' → meeting starts 7:00 AM |
| T13 | PASS | Dragging the hours to the right moves the meeting earlier, snapped to 15 minutes, every city updates | 7:00 AM → 3:45 AM |
| T14 | PASS | Dragging the hours to the left moves the meeting later, snapped to 15 minutes | 3:45 AM → 5:30 AM |
| T15 | PASS | Tapping a suggested time moves the meeting to it | suggestion 7:00 AM → start 7:00 AM |
| T16 | PASS | Tapping an hour in the timeline moves the meeting to that hour | cell 'You · Bogota 6:00 AM' → start 6:00 AM |
| T17 | PASS | Tapping a date chip selects that date | tapped 'Sat, 3, Oct' → Sat, Oct 3 2026 · 1h · Weekend |
| T18 | PASS | Duration chips change the meeting length |  |
| T19 | PASS | Meeting title can be typed and shows on the meeting card |  |
| T20 | PASS | 'Add a city' button on the meeting card opens Add Timezone |  |
| T21 | PASS | Share times opens the share sheet with the meeting text |  |
| T22 | PASS | Add to calendar hands off to Google Calendar / browser | com.google.android.calendar/ |
| T23 | PASS | Returning from Calendar keeps the Meeting as it was; Share as image opens the share sheet |  |
| T24 | PASS | Date chips still respond to the first tap right after a fast swipe to the strip edge | tapped 'Fri, 2, Oct' → Fri, Oct 2 2026 · 1h |
| T25 | PASS | Removing a city on World Clock removes its Meeting row without crashing | rows: 6:00 AM – 7:00 AM/8:00 AM – 9:00 AM/8:00 PM – 9:00 PM/7:00 PM – 8:00 PM/ |
| T26 | PASS | Base currency EUR applies on World Clock |  |
| T27 | PASS | Every other base currency (GBP JPY CNY HKD USD) applies |  |
| T28 | PASS | 24 Hour time format applies |  |
| T29 | PASS | 12 Hour time format applies |  |
| T30 | PASS | All three date formats apply |  |
| T30b | PASS | Settings 'Check for updates' asks Expo's update service and reports the answer | You have the latest version. |
| T31 | PASS | Dark and Light themes apply | brightness dark=96 light=735 |
| T32 | PASS | Auto theme follows the phone's dark / light setting | system dark=96 system light=735 |
| T33 | PASS | Cities and settings survive closing and reopening the app |  |
| T34 | PASS | Deleting every city shows the empty state |  |
| T35 | PASS | Meeting with no cities shows its empty state and an Add a city button |  |
| T36 | PASS | Add a city from the empty Meeting screen works |  |
| T37 | PASS | No crash recorded in the Android crash log during the whole run |  |

## In-app update, tested live on this build

| Step | Result |
|---|---|
| Published a test update to the "preview" channel (update group 8d167eed-4391-47e1-9a40-5bef6f3ec557, no visible change) | Published for fingerprint 0fdf5446…, the same as the installed build |
| Closed and reopened the app | Within about a second: "Update ready — A new version of TimeZone Exchange has downloaded." with Later / Restart now (U1-update-ready-prompt.png) |
| Tapped Restart now, opened Settings | App updates card: Version 1.2.0, This copy "Updated Sep 30, 2026, 11:11 PM" (U2-settings-after-update.png) |
| Tapped Check for updates again | "You have the latest version." (U3-check-after-update.png) |
| Android crash log | No crash from the app |

## What changed in 1.2.0

| Area | Change |
|---|---|
| Meeting | The hour rows are the main control: drag them sideways and the meeting snaps every 15 minutes, every city's meeting time updates live. Removed the 15-minute buttons, start-time card, "set the time in" chips, best-times card and results card. |
| Suggestions | Based on reasonable hours (8am to 9pm local), not office hours; only the best options are shown, at least two hours apart; the screen opens on the top one; a green bar marks when everyone is in reasonable hours. |
| Durations | All six fit across the screen (15m, 30m, 45m, 1h, 1.5h, 2h). |
| Add | About 155 more cities; a Cities / Time zones switch; search by short name (MST, CST, HKT, CET, AEST…), listing every meaning of an ambiguous one. |
| Fixes found on the way | Hanoi used Bangkok's time zone; Reykjavik never appeared in the browse list; the "2h" chip was hidden off screen. |
| Updates | The app checks for updates every time it opens and offers to restart when one has downloaded; Settings has Check for updates. |

## Problems found and fixed during testing

| Problem | Fix |
|---|---|
| First update publish was rejected by Expo: the iOS bundle identifier contained underscores | iOS identifier now uses hyphens (Android package unchanged). This changed the fingerprint, so the earlier build a03e85ed would never have received updates; it was replaced by build e9edbe74, which is the one to install. |
| A version-number change would have blocked updates | fingerprint.config.js leaves the version label out of the fingerprint; checked that 1.2.0 to 1.2.1 keeps the same fingerprint. |
| Local (non-cloud) test builds cannot check for updates | Expected: they carry no update channel, and Expo answers "channel-name: Required". Cloud builds carry the channel; checked directly against Expo's service. |

## Not covered

| Area | Note |
|---|---|
| A real phone | Only the emulator. The APK includes phone processor code as well. |
| An update that changes native code | By design these need a new build link; none was needed here. |
| Notifications, iPhone | Not tested / not built. |
