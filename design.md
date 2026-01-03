# World Clock & Exchange Rate App - Design Document

## App Overview

This mobile app combines world clock functionality with real-time exchange rates, allowing users to track multiple timezones and their corresponding currency values simultaneously. The app is designed for Android with a focus on mobile portrait orientation and one-handed usage.

## Screen List

### 1. Home Screen (World Clock List)
**Primary Content**: Scrollable list of selected timezones with current time and exchange rate
**Functionality**:
- Display current time for each selected timezone
- Show exchange rate (1 USD = X local currency) next to each timezone
- Add new timezone button (floating action button)
- Delete timezone (swipe to delete)
- Pull to refresh exchange rates

**Layout**:
- Each timezone card shows:
  - City/Country name
  - Current time (large, readable)
  - Current date
  - Exchange rate badge (e.g., "1 USD = 7.75 HKD")
  - Currency code

### 2. Add Timezone Screen
**Primary Content**: Searchable list of all available timezones grouped by region
**Functionality**:
- Search bar at top
- Filter timezones by city/country name
- Select timezone and currency pair
- Return to home screen with new timezone added

**Layout**:
- Search input at top
- Grouped list (Americas, Europe, Asia, etc.)
- Each item shows: City, Country, UTC offset

### 3. Meeting Time Converter Screen
**Primary Content**: Time input form with conversion results
**Functionality**:
- Select source timezone (default: first in user's list)
- Date/time picker for meeting time
- Display converted times for all user's selected timezones
- Export as image button (PNG/JPEG)

**Layout**:
- Input section at top:
  - Timezone picker
  - Date picker
  - Time picker
- Results section (scrollable):
  - Cards showing converted time for each timezone
  - Each card: City, Date, Time, Exchange rate
- Export button (floating action button)

### 4. Settings Screen
**Primary Content**: App configuration options
**Functionality**:
- Default currency selection (for exchange rates)
- Time format (12h/24h)
- Date format
- Theme selection (light/dark/auto)
- About/version info

## Key User Flows

### Flow 1: Add New Timezone
1. User taps floating "+" button on home screen
2. Add Timezone screen opens
3. User searches for city (e.g., "Hong Kong")
4. User taps on "Hong Kong (HKT)"
5. User selects currency (HKD)
6. App returns to home screen with new timezone card added
7. Exchange rate automatically fetched and displayed

### Flow 2: Convert Meeting Time
1. User taps "Convert Time" button/tab
2. Meeting Time Converter screen opens
3. User selects source timezone (e.g., "Hong Kong")
4. User picks date and time (e.g., "Jan 15, 2026 2:00 PM")
5. App instantly shows converted times for all saved timezones
6. User taps "Export" button
7. App generates image with all converted times
8. User can share or save image

### Flow 3: View and Refresh Exchange Rates
1. User opens app to home screen
2. All timezone cards show current time + exchange rate
3. User pulls down to refresh
4. Exchange rates update from API
5. Last updated timestamp shown at top

## Color Choices

### Primary Brand Colors
- **Primary Blue**: `#0A7EA4` - Main accent color for buttons, active states
- **Deep Navy**: `#1E3A5F` - Secondary accent for headers
- **Soft White**: `#FFFFFF` - Light mode background
- **Dark Charcoal**: `#151718` - Dark mode background

### Functional Colors
- **Success Green**: `#22C55E` - Positive indicators, refresh success
- **Warning Amber**: `#F59E0B` - Alerts, important notices
- **Error Red**: `#EF4444` - Error states, delete actions

### Text Colors
- **Primary Text**: `#11181C` (light) / `#ECEDEE` (dark)
- **Secondary Text**: `#687076` (light) / `#9BA1A6` (dark)
- **Muted Text**: `#9CA3AF` - Timestamps, helper text

## Design Principles

### iOS Human Interface Guidelines Alignment
- **Clarity**: Large, readable time displays with clear hierarchy
- **Deference**: Content-first design, minimal chrome
- **Depth**: Subtle shadows and elevation for cards
- **Consistency**: Standard iOS patterns for navigation and gestures

### Mobile-First Considerations
- **One-Handed Usage**: Primary actions within thumb reach (bottom 60% of screen)
- **Touch Targets**: Minimum 44x44pt for all interactive elements
- **Readable Typography**: Minimum 16px for body text, 24px+ for time displays
- **Portrait Orientation**: Optimized for 9:16 aspect ratio
- **Swipe Gestures**: Swipe to delete timezones, pull to refresh

### Widget Design
- **Small Widget**: Single timezone with time + exchange rate
- **Medium Widget**: 2-3 timezones in compact list
- **Large Widget**: 4-6 timezones with full details

## Typography Scale
- **Display (Time)**: 48px, bold
- **Heading 1 (City)**: 24px, semibold
- **Heading 2 (Section)**: 20px, semibold
- **Body**: 16px, regular
- **Caption (Exchange Rate)**: 14px, medium
- **Small (Timestamp)**: 12px, regular

## Component Patterns

### Timezone Card
- Rounded corners (16px)
- Subtle shadow (elevation 2)
- Padding: 16px
- Background: Surface color
- Border: 1px solid border color

### Floating Action Button
- Size: 56x56px
- Position: Bottom right, 16px margin
- Elevation: 6
- Icon: Plus or Share symbol

### Time Display
- Large, monospace font for consistency
- Highlight current timezone with subtle background
- Show AM/PM indicator for 12h format
- Display timezone abbreviation (HKT, EST, etc.)

## Data Requirements

### Timezone Data
- Use JavaScript `Intl` API for timezone calculations
- IANA timezone database (built into JavaScript)
- No external API needed

### Exchange Rate Data
- **API**: Frankfurter (https://api.frankfurter.dev/)
- **Endpoint**: `/v1/latest?base=USD`
- **Update Frequency**: On app open + manual refresh
- **Cache Duration**: 1 hour (rates update daily)
- **Fallback**: Show last cached rate if API fails

### Local Storage
- User's selected timezones (AsyncStorage)
- Preferred currency for each timezone
- App settings (theme, format preferences)
- Cached exchange rates with timestamp
