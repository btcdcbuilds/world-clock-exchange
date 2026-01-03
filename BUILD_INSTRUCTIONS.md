# TimeZone Exchange - Build & Deployment Instructions

## App Overview

**TimeZone Exchange** is a world clock and currency exchange rate app for Android that allows users to:
- Track multiple timezones with real-time clock updates
- View exchange rates for each timezone's currency (powered by Frankfurter API)
- Convert meeting times across all selected timezones
- Export meeting time schedules as PNG/JPEG images
- Customize settings (time format, date format, base currency, theme)

## Quick Start - Test on Your Android Device

### Option 1: Using Expo Go (Fastest)

1. **Install Expo Go** on your Android device from Google Play Store
2. **Open Expo Go** app
3. **Scan the QR code** provided in `expo-qr-code.png`
4. The app will load and run on your device

**QR Code Location**: `/home/ubuntu/world_clock_app/expo-qr-code.png`

**Direct URL**: `exps://8081-iofom4brsx4w7eiykh1qp-adee51ad.us2.manus.computer`

### Option 2: Build APK for Installation

To build a standalone APK that can be installed without Expo Go:

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS Build**:
   ```bash
   cd /home/ubuntu/world_clock_app
   eas build:configure
   ```

4. **Build Android APK**:
   ```bash
   eas build --platform android --profile preview
   ```
   
   This will:
   - Upload your project to Expo's build servers
   - Build the APK in the cloud
   - Provide a download link when complete (usually 10-20 minutes)

5. **Download and Install**:
   - Download the APK from the link provided
   - Transfer to your Android device
   - Enable "Install from Unknown Sources" in Android settings
   - Install the APK

### Option 3: Build Locally (Advanced)

For local builds without Expo's cloud service:

1. **Install Android Studio** and set up Android SDK
2. **Run local build**:
   ```bash
   cd /home/ubuntu/world_clock_app
   npx expo run:android
   ```

## Project Structure

```
world_clock_app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen (world clock list)
│   │   ├── converter.tsx      # Meeting time converter
│   │   └── settings.tsx       # Settings screen
│   ├── add-timezone.tsx       # Add timezone screen
│   └── _layout.tsx            # Root layout
├── lib/
│   ├── api.ts                 # Frankfurter API integration
│   ├── storage.ts             # AsyncStorage utilities
│   ├── time-utils.ts          # Timezone conversion utilities
│   ├── timezone-data.ts       # Timezone database (40+ cities)
│   ├── export-utils.ts        # Image export functionality
│   └── types.ts               # TypeScript types
├── assets/images/
│   └── icon.png               # App icon (1024x1024)
└── app.config.ts              # Expo configuration
```

## Features Implemented

### ✅ Core Features
- [x] World clock list with real-time updates
- [x] Exchange rates from Frankfurter API (free, no limits)
- [x] Add/remove timezones with search
- [x] Pull to refresh exchange rates
- [x] Meeting time converter
- [x] Export meeting times as PNG/JPEG
- [x] Settings (theme, time format, date format, base currency)
- [x] Offline mode with cached exchange rates (1-hour cache)
- [x] Empty states and loading indicators
- [x] Custom app icon and branding

### ⚠️ Known Limitations
- **Android Widgets**: Not implemented (requires native code, not supported in Expo managed workflow)
- **TypeScript Warnings**: Minor style prop type warnings (do not affect functionality)

## API Information

### Frankfurter Exchange Rate API
- **URL**: https://api.frankfurter.dev/
- **Cost**: Completely FREE
- **Rate Limits**: NONE
- **API Key**: NOT required
- **Data Source**: European Central Bank
- **Update Frequency**: Daily (around 16:00 CET)
- **Currencies Supported**: 30+ major currencies

The app automatically caches exchange rates for 1 hour to reduce API calls and enable offline functionality.

## Configuration

### App Branding
Edit `app.config.ts` to customize:
- `appName`: Display name (currently "TimeZone Exchange")
- `logoUrl`: S3 URL of app icon
- `androidPackage`: Bundle identifier

### Theme Colors
Edit `theme.config.js` to customize colors:
- `primary`: Main accent color (#0A7EA4)
- `background`: Screen background
- `surface`: Card background
- `foreground`: Text color
- `muted`: Secondary text color

## Development Commands

```bash
# Start development server
pnpm dev

# Run on Android device/emulator
pnpm android

# Generate QR code for Expo Go
pnpm qr

# Type check
pnpm check

# Lint code
pnpm lint

# Format code
pnpm format
```

## Troubleshooting

### App won't load in Expo Go
- Ensure your phone and computer are on the same network
- Try entering the URL manually in Expo Go
- Check that the dev server is running (`pnpm dev`)

### Exchange rates not loading
- Check internet connection
- Verify Frankfurter API is accessible: https://api.frankfurter.dev/v1/latest
- Check cached rates in AsyncStorage

### Image export not working
- Ensure app has storage permissions
- Try exporting as PNG instead of JPEG
- Check that the view is fully rendered before exporting

## Next Steps

1. **Test on Device**: Scan QR code with Expo Go
2. **Build APK**: Use EAS Build for standalone APK
3. **Customize**: Adjust colors, add more timezones, modify UI
4. **Deploy**: Publish to Google Play Store (requires Expo EAS Submit)

## Support

For issues or questions:
- Check Expo documentation: https://docs.expo.dev
- Review Frankfurter API docs: https://frankfurter.dev
- Check React Native docs: https://reactnative.dev

## License

This project uses:
- Expo SDK 54
- React Native 0.81
- Frankfurter API (free, open-source)
- Various open-source packages (see package.json)
