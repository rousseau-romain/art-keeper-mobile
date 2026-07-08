import { useRouter } from "expo-router";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import type { EditProposalValues } from "@/pages/app/artwork/form/ProposeEditForm";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type EditLocationFieldProps = {
  /** Slug for the location form sheet route (`/artworks/[slug]/edit/location`). */
  slug: string;
};

/**
 * The propose-an-edit location field: shows the current pin coordinates and opens
 * the location form sheet to move it. The sheet shares this form's `FormProvider`
 * (hoisted into the edit stack layout), so a moved pin flows straight back into
 * `latitude`/`longitude` here. The map lives in a sheet, not inline, because it
 * can't sit inside the form's `ScrollView` (gesture conflict).
 */
export const EditLocationField = ({ slug }: EditLocationFieldProps) => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { control } = useFormContext<EditProposalValues>();
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });

  const coords =
    latitude != null && longitude != null
      ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
      : "—";

  return (
    <View style={styles.field}>
      <Text font="mono" size="xs" style={styles.label}>
        {tr("artwork.edit.locationLabel")}
      </Text>
      <View style={styles.row}>
        <Icon name="MapPin" size="xs" color="textMuted" />
        <Text font="mono" size="sm" color="textSoft" style={styles.coords}>
          {coords}
        </Text>
      </View>
      <Button
        label={tr("artwork.edit.changeLocation")}
        variant="ghost"
        iconBefore={{ name: "MapPin" }}
        onPress={() =>
          router.push({
            pathname: "/artworks/[slug]/edit/location",
            params: { slug },
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: SpacingEnum.sm },
  label: { textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xs },
  coords: { flex: 1 },
});
