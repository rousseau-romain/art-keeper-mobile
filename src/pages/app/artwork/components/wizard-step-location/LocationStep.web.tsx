import { lazy, Suspense, useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useDeviceLocation } from "@/pages/app/artwork/hooks/useDeviceLocation";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

// react-native-maps has no web build (it calls the native-only
// `codegenNativeComponent`, which crashes the web bundle). This `.web.tsx`
// variant is what Metro resolves on web; it swaps the native map for a
// react-leaflet one. The map itself is lazy + client-gated so `leaflet` never
// evaluates during Expo's static (Node) prerender.
const WebMap = lazy(() => import("./WebMap"));

/** Step 2 (web) — confirm the pin on a Leaflet map; tap/drag to move it, or use device GPS. */
export const LocationStep = () => {
  const { t: tr } = useTranslation();
  const { control } = useFormContext<ArtworkValues>();
  const { setPin, useMyLocation, locating } = useDeviceLocation();

  // useWatch so the React Compiler re-renders this component on each pin change.
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });
  const address = useWatch({ control, name: "address" });

  // Only render the map after mount, so it stays out of the server prerender.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <View style={styles.step}>
      <Text font="display" size="xxl" style={styles.title}>
        {tr("artwork.new.location.title")}
      </Text>
      <Text font="body" size="base" color="inkSoft">
        {tr("artwork.new.location.subtitle")}
      </Text>

      <View style={styles.mapWrap}>
        <View style={styles.hint}>
          <Text font="mono" size="sm" color="accent">
            {tr("artwork.new.location.hint")}
          </Text>
        </View>
        <View style={styles.map}>
          {mounted ? (
            <Suspense fallback={null}>
              <WebMap
                latitude={latitude}
                longitude={longitude}
                accent={ColorEnum.accent}
                onPick={setPin}
              />
            </Suspense>
          ) : null}
        </View>
      </View>

      {address ? (
        <View style={styles.addr}>
          <Icon name="MapPin" size="xs" color="inkSoft" />
          <Text font="mono" size="sm" color="inkSoft">
            {address}
          </Text>
        </View>
      ) : null}

      <Button
        label={tr("artwork.new.location.useMyLocation")}
        variant="ghost"
        block
        loading={locating}
        iconBefore={{ name: "Globe" }}
        onPress={useMyLocation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  step: { flex: 1, gap: SpacingEnum.md },
  title: { textTransform: "uppercase" },
  mapWrap: {
    flex: 1,
    minHeight: 240,
    borderWidth: 1.5,
    borderColor: ColorEnum.accent,
    borderRadius: RadiusEnum.sm,
    overflow: "hidden",
  },
  hint: {
    paddingHorizontal: SpacingEnum.md,
    paddingVertical: SpacingEnum.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: ColorEnum.accent,
    backgroundColor: ColorEnum.surface,
  },
  map: { flex: 1 },
  addr: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
});
