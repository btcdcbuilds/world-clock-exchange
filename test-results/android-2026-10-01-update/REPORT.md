# TimeZone Exchange — in-app update of 1 October 2026: test report

**Result: PASS. Delivered as an in-app update (no new download). Emulator run: 40 of 41 pass; the one failure is the update check, which only local test builds fail (no update channel) and which passed on the real installed build, below.**

| Item | Value |
|---|---|
| What changed | Title box moved to the top of Meeting (the keyboard covered it); Share opens a preview of a readable image card, with Share image and Share as text; text share without GMT clutter; suggestions are the best round time in the morning, midday, afternoon and evening, as a 2x2 grid; the screen opens on the one that suits the most people |
| Commit | e4d844b on branch feature/share-card-more-suggestions |
| Update | Channel "preview", update group 13d0bc6c-5095-4101-8b3f-a2d111d6881c, fingerprint 0fdf544648c9f37e5e9fc79cbb8b4951a4e2cc93 (the same as the installed 1.2.0 build) |
| Device | Android emulator Pixel_6_API_34 (Android 14), serial emulator-5554 |

## Delivered to the real installed build

| Step | Result |
|---|---|
| Installed the Expo cloud build e9edbe74 (the same APK as on Leigh's phone) | Installed |
| Opened the app | "Update ready" prompt after about one second (1-update-ready.png) |
| Restart now, then Settings | "This copy: Updated Oct 1, 2026, 5:27 AM" (2-settings-updated.png) |
| Added Hong Kong Time by typing "hkt", opened Meeting | Title box is above the dates; four suggestions; Evening is "everyone" (3-meeting-after-update.png) |
| Share | Preview card with MEETING TIMES, each city's time, Morning / Evening labels, Share image and Share as text (4-share-preview.png) |
| Share image | Android share sheet with the card as the image (5-share-image-sheet.png) |
| Android crash log | No crash from the app |

## Full emulator run (local release build of the same code)

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
| T12 | PASS | Several suggestions across the day; the Meeting opens on the one that suits the most people | suggestions: 7:00 AM, Morning · 3 of 5/1:30 PM, Midday · 2 of 5/4:30 PM, Afternoon · 2 of 5/7:00 PM, Evening · 3 of 5 → meeting starts 7:00 AM |
| T13 | PASS | Dragging the hours to the right moves the meeting earlier, snapped to 15 minutes, every city updates | 7:00 AM → 3:45 AM |
| T14 | PASS | Dragging the hours to the left moves the meeting later, snapped to 15 minutes | 3:45 AM → 5:45 AM |
| T15 | PASS | Tapping a suggested time moves the meeting to it | suggestion 7:00 AM → start 7:00 AM |
| T16 | PASS | Tapping an hour in the timeline moves the meeting to that hour | cell 'You · Bogota 6:00 AM' → start 6:00 AM |
| T17 | PASS | Tapping a date chip selects that date | tapped 'Sun, 4, Oct' → Sun, Oct 4 2026 · 1h · Weekend |
| T18 | PASS | Duration chips change the meeting length |  |
| T19 | PASS | Meeting title can be typed and shows on the meeting card |  |
| T20 | PASS | 'Add a city' button on the meeting card opens Add Timezone |  |
| T21 | PASS | Share opens a preview card; Share as text opens the share sheet with the meeting text |  |
| T22 | PASS | Add to calendar hands off to Google Calendar / browser | com.google.android.calendar/ |
| T23 | PASS | Returning from Calendar keeps the Meeting as it was; Share image (from the preview) opens the share sheet |  |
| T24 | PASS | Date chips still respond to the first tap right after a fast swipe to the strip edge | tapped 'Sat, 3, Oct' → Sat, Oct 3 2026 · 1h · Weekend |
| T25 | PASS | Removing a city on World Clock removes its Meeting row without crashing | rows: 6:00 AM – 7:00 AM/8:00 AM – 9:00 AM/8:00 PM – 9:00 PM/7:00 PM – 8:00 PM/ |
| T26 | PASS | Base currency EUR applies on World Clock |  |
| T27 | PASS | Every other base currency (GBP JPY CNY HKD USD) applies |  |
| T28 | PASS | 24 Hour time format applies |  |
| T29 | PASS | 12 Hour time format applies |  |
| T30 | PASS | All three date formats apply |  |
| T30b | FAIL | Settings 'Check for updates' asks Expo's update service and reports the answer | Couldn't check for updates. Check the internet connection and try again. |
| T31 | PASS | Dark and Light themes apply | brightness dark=96 light=735 |
| T32 | PASS | Auto theme follows the phone's dark / light setting | system dark=96 system light=735 |
| T33 | PASS | Cities and settings survive closing and reopening the app |  |
| T34 | PASS | Deleting every city shows the empty state |  |
| T35 | PASS | Meeting with no cities shows its empty state and an Add a city button |  |
| T36 | PASS | Add a city from the empty Meeting screen works |  |
| T37 | PASS | No crash recorded in the Android crash log during the whole run |  |

T30b fails on local builds by design: they carry no update channel, and Expo answers "channel-name: Required". The same check passed on the cloud build on 30 September, and the delivery above was done on the cloud build.

## Not covered

| Area | Note |
|---|---|
| Your Samsung | Not tested here; the update is published to its channel and should arrive the next time the app opens. |
