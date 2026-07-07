import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";

import { ArtistDiffRow } from "@/pages/app/moderation/components/artist-diff-row/ArtistDiffRow";
import { DiffRow } from "@/pages/app/moderation/components/diff-row/DiffRow";
import { LocationDiffRow } from "@/pages/app/moderation/components/location-diff-row/LocationDiffRow";
import {
  type DiffField,
  FIELD_LABEL_KEY,
} from "@/pages/app/moderation/proposal-diff";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type DiffPanelProps = {
  /** Which side this panel renders. */
  side: "before" | "after";
  /** The proposal's per-field diff (photo drives the image box). */
  fields: DiffField[];
};

/**
 * One side of the before/after diff: a header caption, the artwork photo box,
 * and a row per changed/unchanged text field. The whole panel is tinted red for
 * the current ("before") side and green for the proposed ("after") side.
 */
export const DiffPanel = ({ side, fields }: DiffPanelProps) => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  const before = side === "before";
  const accent = before ? colors.danger : colors.success;
  const accentBg = before ? colors.dangerBg : colors.successBg;

  const photo = fields.find((field) => field.key === "photo");
  const rows = fields.filter((field) => field.key !== "photo");
  const photoUrl = before ? photo?.before : photo?.after;

  return (
    <View
      style={[styles.panel, { borderColor: accent, backgroundColor: accentBg }]}
    >
      <View style={styles.header}>
        <Text
          font="mono"
          size="xs"
          style={styles.headerLabel}
          color="textMuted"
        >
          {`${before ? "-" : "+"} ${tr(before ? "moderation.current" : "moderation.proposed")}`}
        </Text>
        <Text
          font="mono"
          size="xs"
          style={styles.headerLabel}
          color="textMuted"
        >
          {tr(before ? "moderation.before" : "moderation.after")}
        </Text>
      </View>

      <View
        style={[
          styles.photo,
          { borderColor: photo?.changed ? accent : colors.borderSoft },
        ]}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photoImage} />
        ) : (
          <Icon name="ImageOff" size="xl" color="textMuted" />
        )}
        {photo?.changed && (
          <View
            style={[styles.photoCaption, { backgroundColor: colors.scrim }]}
          >
            <Text font="mono" size="xs" color="text">
              {tr(
                before ? "moderation.photoCurrent" : "moderation.photoProposed",
              )}
            </Text>
          </View>
        )}
      </View>

      <View>
        {rows.map((field) => {
          const value = before ? field.before : field.after;

          if (field.key === "artist") {
            return (
              <ArtistDiffRow
                key={field.key}
                artistId={value}
                side={side}
                changed={field.changed}
              />
            );
          }

          if (field.key === "location") {
            return (
              <LocationDiffRow
                key={field.key}
                value={value}
                side={side}
                changed={field.changed}
              />
            );
          }

          return (
            <DiffRow
              key={field.key}
              label={tr(FIELD_LABEL_KEY[field.key])}
              value={value ?? tr("moderation.noValue")}
              side={side}
              changed={field.changed}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: RadiusEnum.lg,
    padding: SpacingEnum.md,
    gap: SpacingEnum.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLabel: { textTransform: "uppercase", letterSpacing: 0.5 },
  photo: {
    aspectRatio: 3 / 2,
    borderWidth: 1.5,
    borderRadius: RadiusEnum.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImage: { width: "100%", height: "100%" },
  photoCaption: {
    position: "absolute",
    bottom: SpacingEnum.sm,
    paddingVertical: SpacingEnum.xs,
    paddingHorizontal: SpacingEnum.sm,
    borderRadius: RadiusEnum.sm,
  },
});
