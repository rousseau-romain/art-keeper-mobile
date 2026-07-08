import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { EditLocationField } from "@/pages/app/artwork/components/edit-location-field/EditLocationField";
import { ArtworkForm } from "@/pages/app/artwork/form/ArtworkForm";
import { Checkbox } from "@/shared/ui/checkbox/Checkbox";
import { TextInput } from "@/shared/ui/input/TextInput";
import { SpacingEnum } from "@/theme/enums/scale.enums";

/**
 * What the "propose an edit" screen collects — the shared artwork fields (reused
 * from `ArtworkForm`) plus the required edit reason and an accuracy confirmation.
 * The screen-facing `note` maps to the API's `note`; the form's `description`
 * (the "Note" field) maps to the API's `description` (see `useProposeEditSubmit`).
 */
export type EditProposalValues = {
  title: string;
  artistId: string | null;
  artistHandle: string;
  tags: string[];
  description: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  note: string;
  accuracyConfirmed: boolean;
};

export type ProposeEditFormProps = {
  /** Slug threaded to the location field for the form-sheet route. */
  slug: string;
};

/** Propose-an-edit fields: reuses the artwork fields, adds a reason + accuracy check. */
export const ProposeEditForm = ({ slug }: ProposeEditFormProps) => {
  const { t: tr } = useTranslation();
  const { control } = useFormContext<EditProposalValues>();

  return (
    <View style={styles.form}>
      <ArtworkForm />

      <EditLocationField slug={slug} />

      <Controller
        control={control}
        name="note"
        rules={{ required: tr("artwork.edit.errors.reasonRequired") }}
        render={({ field, fieldState }) => (
          <TextInput
            label={tr("artwork.edit.reasonLabel")}
            placeholder={tr("artwork.edit.reasonPlaceholder")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            multiline
            numberOfLines={3}
          />
        )}
      />

      <Controller
        control={control}
        name="accuracyConfirmed"
        render={({ field }) => (
          <Checkbox
            checked={field.value}
            onChange={field.onChange}
            label={tr("artwork.edit.accuracy")}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  form: { gap: SpacingEnum.xl },
});
