import { Image } from "expo-image";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** The step routes a "Edit" jump can target (the rights step has no edit). */
export type ReviewEditTarget = "location" | "details";

export type ReviewStepProps = {
  onEdit: (target: ReviewEditTarget) => void;
};

/** Step 4 — summary with per-section edit jumps + the rights confirmation. */
export const ReviewStep = ({ onEdit }: ReviewStepProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);
  const { control, setValue } = useFormContext<ArtworkValues>();
  // Per-field useWatch (typed, non-optional) so the rights checkbox and every
  // edited value update in place under the React Compiler, not only on remount.
  const photo = useWatch({ control, name: "photo" });
  const address = useWatch({ control, name: "address" });
  const tags = useWatch({ control, name: "tags" });
  const note = useWatch({ control, name: "note" });
  const title = useWatch({ control, name: "title" });
  const artistHandle = useWatch({ control, name: "artistHandle" });
  const rightsConfirmed = useWatch({ control, name: "rightsConfirmed" });

  const rows: {
    key: string;
    label: string;
    value: string;
    target: ReviewEditTarget;
  }[] = [
    {
      key: "where",
      label: tr("artwork.new.review.where"),
      value: address || "—",
      target: "location",
    },
    {
      key: "tags",
      label: tr("artwork.new.review.tags"),
      value: tags.length ? tags.map((t) => `#${t}`).join(" ") : "—",
      target: "details",
    },
    {
      key: "note",
      label: tr("artwork.new.review.note"),
      value: note || "—",
      target: "details",
    },
  ];

  return (
    <View style={styles.step}>
      <Text font="display" size="xxl" style={styles.title}>
        {tr("artwork.new.review.title")}
      </Text>

      <View style={styles.headerRow}>
        {photo && (
          <Image
            source={{ uri: photo.uri }}
            style={styles.thumb}
            contentFit="cover"
          />
        )}
        <View style={styles.headerText}>
          <Text font="display" size="lg" style={styles.pieceTitle}>
            {title || tr("artwork.title.new")}
          </Text>
          <Text font="body" size="sm" color="textMuted">
            {artistHandle
              ? `@${artistHandle}`
              : tr("artwork.new.review.noArtist")}
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.key} style={styles.row}>
            <Text
              font="mono"
              size="xs"
              color="textMuted"
              style={styles.rowLabel}
            >
              {row.label}
            </Text>
            <Text
              font="body"
              size="sm"
              color="textSoft"
              style={styles.rowValue}
            >
              {row.value}
            </Text>
            <Pressable onPress={() => onEdit(row.target)} hitSlop={6}>
              <Text font="mono" size="sm" color="primary">
                {tr("artwork.new.review.edit")}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>

      <Checkbox
        checked={rightsConfirmed}
        onChange={(v) => setValue("rightsConfirmed", v)}
        label={tr("artwork.new.review.rights")}
      />
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    step: { gap: SpacingEnum.xl },
    title: { textTransform: "uppercase" },
    headerRow: { flexDirection: "row", gap: SpacingEnum.md },
    thumb: {
      width: ControlHeightEnum.md,
      height: ControlHeightEnum.md,
      borderRadius: RadiusEnum.sm,
      backgroundColor: c.surface2,
    },
    headerText: { flex: 1, gap: SpacingEnum.xs },
    pieceTitle: { textTransform: "uppercase" },
    rows: { gap: SpacingEnum.lg },
    row: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.md },
    rowLabel: { width: ControlHeightEnum.md, textTransform: "uppercase" },
    rowValue: { flex: 1 },
  });
