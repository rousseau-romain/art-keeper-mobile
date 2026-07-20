import * as Location from "expo-location";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useToast } from "@/shared/ui/toast/Toast";

/** A coordinate label used as the baseline address (always available). */
const formatCoords = (latitude: number, longitude: number) =>
  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

/**
 * Owns the location step's device access: moving the pin and the "use my
 * location" action. The pin label (`address`) defaults to the coordinates and
 * is upgraded to a street address via the native reverse-geocoder where
 * available — the web Geocoding API was removed in SDK 49, so we never call it
 * on web (it would only warn and return nothing).
 */
export const useDeviceLocation = () => {
  const { t: tr } = useTranslation();
  const { setValue } = useFormContext<ArtworkValues>();
  const { show } = useToast();
  const [isLocating, setIsLocating] = useState(false);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    if (Platform.OS === "web") return;
    try {
      const [place] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (!place) return;
      const street = [place.streetNumber, place.street]
        .filter(Boolean)
        .join(" ");
      const city = [place.postalCode, place.city].filter(Boolean).join(" ");
      const label = [street, city].filter(Boolean).join(", ");
      if (label) setValue("address", label);
    } catch {
      // Best-effort — the coordinate label set by setPin already stands in.
    }
  };

  const setPin = (latitude: number, longitude: number) => {
    setValue("latitude", latitude);
    setValue("longitude", longitude);
    setValue("address", formatCoords(latitude, longitude));
    reverseGeocode(latitude, longitude);
  };

  const useMyLocation = async () => {
    setIsLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        show(tr("artwork.new.location.error"), "error");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setPin(pos.coords.latitude, pos.coords.longitude);
    } catch {
      show(tr("artwork.new.location.error"), "error");
    } finally {
      setIsLocating(false);
    }
  };

  return { setPin, reverseGeocode, useMyLocation, isLocating };
};
