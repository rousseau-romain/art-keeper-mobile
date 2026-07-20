import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { DiffRow } from "@/pages/app/moderation/components/diff-row/DiffRow";
import {
  FIELD_LABEL_KEY,
  parseCoords,
} from "@/pages/app/moderation/proposal-diff";

export type LocationDiffRowProps = {
  /** The formatted `"lat, lng"` for this side (or null when unset). */
  value: string | null;
  /** Which panel this row belongs to — drives the tint + marker. */
  side: "before" | "after";
  /** Whether the proposal changes the location. */
  isChanged: boolean;
};

/**
 * The location diff row. Renders the coordinate like any {@link DiffRow}, but
 * when this side has coordinates the row becomes tappable and opens the
 * read-only map form sheet (`/admin/location`) centered on the pin.
 */
export const LocationDiffRow = ({
  value,
  side,
  isChanged,
}: LocationDiffRowProps) => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const coords = parseCoords(value);

  const openMap = coords
    ? () =>
        router.push({
          pathname: "/admin/location",
          params: {
            lat: String(coords.latitude),
            lng: String(coords.longitude),
          },
        })
    : undefined;

  return (
    <DiffRow
      label={tr(FIELD_LABEL_KEY.location)}
      value={value ?? tr("moderation.noValue")}
      side={side}
      isChanged={isChanged}
      onPress={openMap}
      accessibilityLabel={tr("a11y.viewOnMap")}
    />
  );
};
