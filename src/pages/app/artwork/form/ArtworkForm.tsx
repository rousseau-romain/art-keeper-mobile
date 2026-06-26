import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { ArtistAutocomplete } from "@/pages/app/artwork/components/artist-autocomplete/ArtistAutocomplete";
import { TagPicker } from "@/pages/app/artwork/components/tag-picker/TagPicker";
import { TextInput } from "@/shared/ui/input/TextInput";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtworkPhoto = { uri: string; width: number; height: number };

/** Everything the new-artwork wizard collects across its steps. */
export type ArtworkValues = {
  photo: ArtworkPhoto | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  title: string;
  artistId: string | null;
  artistHandle: string;
  tags: string[];
  note: string;
  rightsConfirmed: boolean;
};

/** Details step — title, artist autocomplete, preset tag chips, optional note. */
export const ArtworkForm = () => {
  const { t: tr } = useTranslation();
  const { control } = useFormContext<ArtworkValues>();

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="title"
        rules={{ required: tr("artwork.new.errors.titleRequired") }}
        render={({ field, fieldState }) => (
          <TextInput
            label={tr("artwork.new.details.titleLabel")}
            placeholder={tr("artwork.new.details.titlePlaceholder")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <ArtistAutocomplete
        label={tr("artwork.new.details.artistLabel")}
        placeholder={tr("artwork.new.details.artistPlaceholder")}
      />

      <Controller
        control={control}
        name="tags"
        render={({ field }) => (
          <View style={styles.field}>
            <Text font="mono" size="xs" style={styles.label}>
              {tr("artwork.new.details.tagsLabel")}
            </Text>
            <TagPicker value={field.value} onChange={field.onChange} />
          </View>
        )}
      />

      <Controller
        control={control}
        name="note"
        render={({ field }) => (
          <TextInput
            label={tr("artwork.new.details.noteLabel")}
            placeholder={tr("artwork.new.details.notePlaceholder")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            multiline
            numberOfLines={3}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  form: { gap: SpacingEnum.xl },
  field: { gap: SpacingEnum.sm },
  label: { textTransform: "uppercase" },
});
