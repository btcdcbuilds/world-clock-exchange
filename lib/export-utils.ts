import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Platform, Alert } from "react-native";

/**
 * Capture a view as an image and share it
 * @param viewRef - Reference to the view to capture
 * @param filename - Name of the file to save
 * @returns Promise that resolves when sharing is complete
 */
export async function captureAndShareView(
  viewRef: any,
  filename: string = "meeting-times.png"
): Promise<void> {
  try {
    if (!viewRef || !viewRef.current) {
      throw new Error("View reference is not available");
    }

    // Capture the view as an image
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        "Sharing Not Available",
        "Sharing is not available on this device"
      );
      return;
    }

    // Share the image
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: "Share Meeting Times",
      UTI: "public.png",
    });
  } catch (error) {
    console.error("Failed to capture and share view:", error);
    Alert.alert("Export Failed", "Failed to export image. Please try again.");
    throw error;
  }
}

/**
 * Capture a view and save it to device
 * @param viewRef - Reference to the view to capture
 * @param filename - Name of the file to save
 * @returns Promise that resolves with the file URI
 */
export async function captureAndSaveView(
  viewRef: any,
  filename: string = "meeting-times.png"
): Promise<string> {
  try {
    if (!viewRef || !viewRef.current) {
      throw new Error("View reference is not available");
    }

    // Capture the view as an image
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    // Create a permanent file path
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Copy the temporary file to permanent location
    await FileSystem.copyAsync({
      from: uri,
      to: fileUri,
    });

    return fileUri;
  } catch (error) {
    console.error("Failed to capture and save view:", error);
    Alert.alert("Save Failed", "Failed to save image. Please try again.");
    throw error;
  }
}

/**
 * Capture a view as JPEG
 * @param viewRef - Reference to the view to capture
 * @param filename - Name of the file to save
 * @param quality - JPEG quality (0-1)
 * @returns Promise that resolves when sharing is complete
 */
export async function captureAndShareAsJPEG(
  viewRef: any,
  filename: string = "meeting-times.jpg",
  quality: number = 0.9
): Promise<void> {
  try {
    if (!viewRef || !viewRef.current) {
      throw new Error("View reference is not available");
    }

    // Capture the view as an image
    const uri = await captureRef(viewRef, {
      format: "jpg",
      quality,
      result: "tmpfile",
    });

    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert(
        "Sharing Not Available",
        "Sharing is not available on this device"
      );
      return;
    }

    // Share the image
    await Sharing.shareAsync(uri, {
      mimeType: "image/jpeg",
      dialogTitle: "Share Meeting Times",
      UTI: "public.jpeg",
    });
  } catch (error) {
    console.error("Failed to capture and share view:", error);
    Alert.alert("Export Failed", "Failed to export image. Please try again.");
    throw error;
  }
}
