/**
 * What decides whether an in-app update can reach an installed build (runtimeVersion "fingerprint").
 * Skipped here because they don't change the native app: the version label (so a screen-only
 * release can bump it), the iOS bundle identifier (Android builds only), and the package.json
 * "android"/"ios" shortcut scripts.
 * @type {import('expo/fingerprint').Config}
 */
const config = {
  sourceSkips: [
    "ExpoConfigVersions",
    "ExpoConfigIosBundleIdentifier",
    "PackageJsonAndroidAndIosScriptsIfNotContainRun",
  ],
};
module.exports = config;
