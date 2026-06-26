import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ActionSheetIOS, Platform } from "react-native";

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
  const [exifPinned, setExifPinned] = useState(false);

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) return;
    const asset = result.assets[0];
    setValue(
      "photo",
      { uri: asset.uri, width: asset.width, height: asset.height },
      { shouldValidate: true },
    );
    const gps = readExifGps(asset.exif);
    if (gps) {
      // Route through setPin so the address label gets filled (coords, upgraded
      // to a street address by the native reverse-geocoder) just like a manual pin.
      setPin(gps.latitude, gps.longitude);
      setExifPinned(true);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      exif: true,
      quality: 0.8,
    });
    handleResult(result);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({
      exif: true,
      quality: 0.8,
    });
    handleResult(result);
  };

  // iOS gets a native action sheet (camera vs library); elsewhere go straight
  // to the library picker (which can also open the camera on Android).
  const addPhoto = () => {
    if (Platform.OS !== "ios") {
      pickFromLibrary();
      return;
    }
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
  };

  return { photo, addPhoto, pickFromLibrary, takePhoto, exifPinned };
};
