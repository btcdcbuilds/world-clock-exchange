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
