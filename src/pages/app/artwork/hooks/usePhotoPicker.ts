import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ActionSheetIOS, Alert, Platform } from "react-native";

import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useDeviceLocation } from "@/pages/app/artwork/hooks/useDeviceLocation";

/** Pull a signed decimal GPS pair out of an image asset's EXIF, if present. */
const readExifGps = (
  exif: Record<string, unknown> | null | undefined,
): { latitude: number; longitude: number } | null => {
  if (!exif) return null;
  // expo-image-picker flattens GPS onto the exif object on most platforms, but
  // iOS sometimes nests it under "{GPS}" — handle both shapes.
  const nested = (exif["{GPS}"] ?? {}) as Record<string, unknown>;
  const lat = (exif.GPSLatitude ?? nested.Latitude) as number | undefined;
  const lon = (exif.GPSLongitude ?? nested.Longitude) as number | undefined;
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  const latRef = (exif.GPSLatitudeRef ?? nested.LatitudeRef) as
    | string
    | undefined;
  const lonRef = (exif.GPSLongitudeRef ?? nested.LongitudeRef) as
    | string
    | undefined;
  return {
    latitude: latRef === "S" ? -Math.abs(lat) : lat,
    longitude: lonRef === "W" ? -Math.abs(lon) : lon,
  };
};

/**
 * Web only: turn a picker `blob:` URL — which is bound to the live document and
 * dies on reload — into a self-contained `data:` URL, so a saved draft can
 * restore the photo after a tab reload (native keeps its durable `file://` uri).
 */
const blobUriToDataUrl = async (uri: string): Promise<string> => {
  const blob = await fetch(uri).then((r) => r.blob());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

/**
 * Owns the photo step: launches the camera or library via expo-image-picker,
 * sets the single `photo` form field (replacing any prior pick), and auto-pins
 * the map from EXIF GPS when the chosen photo carries it.
 */
export const usePhotoPicker = () => {
  const { t: tr } = useTranslation();
  const { control, setValue } = useFormContext<ArtworkValues>();
  const { setPin } = useDeviceLocation();
  // useWatch so the preview re-renders the moment a photo is set (the React
  // Compiler memoizes the watch() fn form otherwise).
  const photo = useWatch({ control, name: "photo" });
  const [isExifPinned, setIsExifPinned] = useState(false);

  const handleResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const asset = result.assets[0];
    // On web the asset.uri is an ephemeral blob: URL; persist the bytes as a
    // data: URL so the draft survives a reload. Native keeps the file:// path.
    const uri =
      Platform.OS === "web" ? await blobUriToDataUrl(asset.uri) : asset.uri;
    setValue(
      "photo",
      { uri, width: asset.width, height: asset.height },
      { shouldValidate: true },
    );
    const gps = readExifGps(asset.exif);
    if (gps) {
      // Route through setPin so the address label gets filled (coords, upgraded
      // to a street address by the native reverse-geocoder) just like a manual pin.
      setPin(gps.latitude, gps.longitude);
      setIsExifPinned(true);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      exif: true,
      quality: 0.8,
    });
    await handleResult(result);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      exif: true,
      quality: 0.8,
    });
    await handleResult(result);
  };

  // Offer the same camera-vs-library choice on every platform: iOS gets a native
  // action sheet, Android (and others) the RN Alert — both wired to takePhoto /
  // pickFromLibrary.
  const addPhoto = () => {
    // Web has no usable action sheet — RN-web's Alert.alert is a button-less
    // window.alert, so the camera/library onPress never fire. Go straight to the
    // library, which opens the browser's native file picker.
    if (Platform.OS === "web") {
      pickFromLibrary();
      return;
    }
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            tr("artwork.new.photo.camera"),
            tr("artwork.new.photo.library"),
            tr("artwork.new.cancel"),
          ],
          cancelButtonIndex: 2,
        },
        (index) => {
          if (index === 0) takePhoto();
          if (index === 1) pickFromLibrary();
        },
      );
      return;
    }
    Alert.alert(tr("artwork.new.photo.title"), undefined, [
      { text: tr("artwork.new.photo.camera"), onPress: takePhoto },
      { text: tr("artwork.new.photo.library"), onPress: pickFromLibrary },
      { text: tr("artwork.new.cancel"), style: "cancel" },
    ]);
  };

  return { photo, addPhoto, pickFromLibrary, takePhoto, isExifPinned };
};
