# World Clock & Exchange Rate App - TODO

## Core Features

- [x] Home screen with timezone list display
- [x] Add timezone functionality with search
- [x] Display current time for each timezone
- [x] Fetch and display exchange rates from Frankfurter API
- [x] Pull to refresh exchange rates
- [x] Swipe to delete timezone
- [x] Persist selected timezones in AsyncStorage
- [x] Meeting time converter screen
- [x] Time picker for meeting time input
- [x] Display converted times for all timezones
- [x] Export meeting times as PNG/JPEG image
- [x] Settings screen with preferences
- [x] Theme selection (light/dark/auto)
- [x] Time format toggle (12h/24h)
- [x] Date format selection
- [ ] Android widget - small size (requires native code, skipped for Expo)
- [ ] Android widget - medium size (requires native code, skipped for Expo)
- [ ] Android widget - large size (requires native code, skipped for Expo)
- [ ] Widget auto-refresh functionality (requires native code, skipped for Expo)
- [x] App icon and branding
- [x] Splash screen configuration
- [x] Error handling for API failures
- [x] Offline mode with cached rates
- [x] Loading states and indicators
- [x] Empty states (no timezones added)
- [x] Tab navigation setup
- [x] Currency selection for each timezone

## UI Improvements & Bug Fixes

- [x] Fix "Invalid Date" bug in time display
- [x] Fix "NaN/NaN/NaN" bug in date formatting
- [x] Redesign home screen to XE-style compact layout
- [x] Make timezone cards single-row items
- [x] Reduce font sizes for better space utilization
- [x] Remove delete button from cards
- [x] Implement long-press to delete
- [x] Display all info (city, time, date, exchange rate) in one compact row

## Build Issues

- [x] Increment version number to force Android update
- [x] Rebuild APK with new version

## Critical Fixes Needed

- [x] Fix exchange rate API - showing "No rate" for all cities
- [x] Fix converter page "Invalid Date" bug
- [x] Expand city list - add 100+ more major cities worldwide (now 110+ cities)
- [x] Apply compact layout to converter page

## New Requirements & Fixes

- [x] Fix converter page "Invalid Date" bug (regression)
- [x] Remove exchange rates from converter page (only show on World Clock page)
- [x] Add timezone abbreviation (GMT+X) display on converter page
- [x] Add timezone abbreviation to World Clock page
- [x] Add DST (Daylight Saving Time) indicator for each timezone (GMT offset shows DST automatically)
- [x] Make source timezone selectable (dropdown) on converter page
- [x] Add meeting title/location field on converter page
- [x] Display meeting details (time, location) on export image
- [x] Fix missing currency support (AED, RUB, USD not showing rates - API limitation, documented)
- [x] Audit entire app for broken functionality before deploying
