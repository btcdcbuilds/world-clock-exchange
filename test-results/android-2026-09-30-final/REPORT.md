# TimeZone Exchange — Android emulator test report

**Result: PASS — 38 of 38 checks passed, 0 failed.**

| Item | Value |
|---|---|
| Date | Wednesday 30 September 2026, run from 8:16 PM to 8:27 PM (emulator clock) |
| App | TimeZone Exchange version 1.1.0, package space.manus.world_clock_app.t20260102193011 |
| Build tested | Expo cloud build 0c41d233-03d7-40b9-923b-0698b21ef940 (preview profile, installable APK file), made from commit 526b01a on branch fix/settings-theme-currency-search-tap |
| Download page | https://expo.dev/accounts/leigh2626/projects/world-clock-app/builds/0c41d233-03d7-40b9-923b-0698b21ef940 |
| Direct APK file | https://expo.dev/artifacts/eas/MsmmvjqCdhjV7SeebxG8LQqAwkeI82QvnnRmAVdEgOA.apk |
| Device | Android emulator Pixel_6_API_34 (Android 14, x86_64), serial emulator-5554 |
| How it was installed | Old copy uninstalled, the cloud APK installed fresh, and app data cleared at the start of the run (true first launch) |
| How it was driven | scripts/android-e2e.sh: taps every control by its on-screen label over adb, reads the screen back, saves one screenshot per check |
| Unit tests | 27 passed, 1 skipped on purpose (vitest); TypeScript check clean |

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
| T09 | PASS | Pull down to refresh works |  |
| T10 | PASS | Long-press → Cancel keeps the city |  |
| T11 | PASS | Meeting tab opens with host chips for My time and each city |  |
| T12 | PASS | Meeting title can be typed |  |
| T13 | PASS | ± buttons move the start time by 15 minutes | 9:00 PM → 9:15 PM → 8:45 PM |
| T14 | PASS | Previous day / Next day arrows change the date | Wed, Sep 30 2026 → Thu, Oct 1 2026 → Wed, Sep 30 2026 |
| T15 | PASS | Tapping a date chip selects that date | tapped 'Sat, 3, Oct' → Sat, Oct 3 2026  · Weekend |
| T16 | PASS | Duration chips can be selected |  |
| T17 | PASS | Host chip re-expresses the same moment in the chosen city | START TIME IN TOKYO 8:45 PM → 10:45 AM |
| T18 | PASS | Tapping a best-time suggestion sets that start time | suggestion 7:00 AM → start 7:00 AM |
| T19 | PASS | Tapping an hour in the 24-hour grid sets the start time | cell 'You · Bogota 5:00 AM' → start 5:00 AM |
| T20 | PASS | 'Add a city' button in the grid opens Add Timezone |  |
| T21 | PASS | Share times opens the share sheet with the meeting text |  |
| T22 | PASS | Add to calendar hands off to Google Calendar / browser | com.google.android.calendar/ |
| T23 | PASS | Returning from Calendar keeps the Meeting as it was; Share as image opens the share sheet |  |
| T24 | PASS | Chips still respond to the first tap right after a fast swipe to the strip edge | START TIME IN BANGKOK |
| T25 | PASS | Deleting the host city falls back to My time without crashing | 5:00 PM Bangkok → START TIME IN MY TIME 5:00 AM |
| T26 | PASS | Base currency EUR applies on World Clock |  |
| T27 | PASS | Every other base currency (GBP JPY CNY HKD USD) applies |  |
| T28 | PASS | 24 Hour time format applies |  |
| T29 | PASS | 12 Hour time format applies |  |
| T30 | PASS | All three date formats apply |  |
| T31 | PASS | Dark and Light themes apply | brightness dark=96 light=735 |
| T32 | PASS | Auto theme follows the phone's dark / light setting | system dark=96 system light=735 |
| T33 | PASS | Cities and settings survive closing and reopening the app |  |
| T34 | PASS | Deleting every city shows the empty state |  |
| T35 | PASS | Meeting with no cities shows its empty state and an Add a city button |  |
| T36 | PASS | Add a city from the empty Meeting screen works |  |
| T37 | PASS | No crash recorded in the Android crash log during the whole run |  |

Screenshots: one per check in the screenshots folder next to this report (T01.png to T37.png, named by check).
T31-dark-theme.png and T31-dark-theme-meeting.png were captured by hand after the run to show the Dark theme on Settings and Meeting.
Full log: run.log. Machine-readable results: results.tsv.

## What was fixed to get here

| Problem | Cause | Fix |
|---|---|---|
| The cloud APK crashed on the emulator at launch | The build only included phone (ARM) processor code, so the x86_64 emulator could not load it. Real phones were not affected. | Added x86_64 to the Android build processor list in app.config.ts (commit 526b01a) |
| Checks T31 and T32 (Dark / Light / Auto theme) failed in the first run | The test read the screen once, 1.5 seconds after the tap. On a busy emulator the theme sometimes took up to 2 seconds to repaint, so the test saw the old colours. The setting itself worked. | The test now re-checks the screen for up to about 3 seconds. A separate timing check on a fresh install showed Dark and Light fully applied within 0.7 seconds of the tap. |

## Earlier runs that do not count

| Run | Result | Why it does not count |
|---|---|---|
| First run, morning of 30 September | 36 pass, 2 fail | Theme checks failed because of the test timing problem above. Kept in test-results/android-2026-09-30/run1-results.tsv. |
| Two reruns around 8:05 PM | 13 pass / 25 fail and 15 pass / 23 fail | Two test sessions drove the same emulator at the same time and wiped each other's app data mid-run. Not app failures. |

## Not covered

| Area | Note |
|---|---|
| A real Samsung or other physical phone | Only the emulator was tested. The APK is built for real phone processors as well. |
| Notifications | Not tested. The app asks for notification permission, but no test exercised a notification. |
| iPhone | Not built or tested. |
