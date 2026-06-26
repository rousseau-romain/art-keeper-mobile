import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import type { ArtistListItem } from "@/lib/api/artists";
import { ApiError } from "@/lib/api/client";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useArtistSearch } from "@/pages/app/artwork/hooks/useArtistSearch";
import { Check } from "@/shared/ui/check/Check";
import { TextInput } from "@/shared/ui/input/TextInput";
import { Text } from "@/shared/ui/text/Text";
import { useToast } from "@/shared/ui/toast/Toast";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtistAutocompleteProps = {
  label: string;
  placeholder: string;
};

/**
 * @handle autocomplete over verified artists. Reads/writes the form directly
 * (`artistId` + `artistHandle`) so it composes into `ArtworkForm` without
 * prop-drilling `control`. Editing after a pick clears the resolved id until a
 * new artist is selected.
 */
export const ArtistAutocomplete = ({
  label,
  placeholder,
}: ArtistAutocompleteProps) => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const { control, setValue } = useFormContext<ArtworkValues>();
  const artistId = useWatch({ control, name: "artistId" });
  const { query, setQuery, matches, isLoading, createArtist, creating } =
    useArtistSearch();

  const select = (artist: ArtistListItem) => {
    setValue("artistId", artist.id);
    setValue("artistHandle", artist.slug);
    setQuery(`@${artist.slug}`);
  };

  const onChangeText = (text: string) => {
    setQuery(text);
    if (artistId) {
      setValue("artistId", null);
      setValue("artistHandle", "");
    }
  };

  // Name to create: the raw query without a leading "@", display-cased.
  const newName = query.trim().replace(/^@/, "");

  const onCreate = async () => {
    try {
      select(await createArtist(newName));
    } catch (e) {
      show(
        e instanceof ApiError ? e.message : tr("auth.genericError"),
        "error",
      );
    }
  };

  const showDropdown = matches.length > 0 && !artistId;
  const showCreate =
    !artistId && !isLoading && matches.length === 0 && newName.length > 0;

  return (
    <View style={styles.field}>
      <TextInput
        label={label}
        placeholder={placeholder}
        value={query}
        onChangeText={onChangeText}
        debounce={200}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showDropdown && (
        <View style={styles.dropdown}>
          {matches.map((artist) => (
            <Pressable
              key={artist.id}
              onPress={() => select(artist)}
              style={styles.row}
            >
              <Text font="mono" size="sm" color="ink">
                @{artist.slug}
              </Text>
              <View style={styles.rowRight}>
                <Text font="body" size="sm" color="inkMute">
                  {artist.name}
                </Text>
                {artist.verified && <Check size="sm" />}
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {showCreate && (
        <Pressable
          onPress={onCreate}
          disabled={creating}
          style={[styles.create, creating && styles.createPending]}
        >
          <Text font="body" size="sm" color="ink">
            {tr("artwork.new.details.createArtist", { name: newName })}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: SpacingEnum.sm },
  dropdown: {
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
    borderColor: ColorEnum.hair,
    backgroundColor: ColorEnum.surface2,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SpacingEnum.md,
    paddingVertical: SpacingEnum.sm,
    gap: SpacingEnum.md,
  },
  rowRight: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.sm },
  create: {
    borderWidth: 1.5,
    borderRadius: RadiusEnum.sm,
    borderColor: ColorEnum.hair,
    backgroundColor: ColorEnum.surface2,
    paddingHorizontal: SpacingEnum.md,
    paddingVertical: SpacingEnum.sm,
  },
  createPending: { opacity: 0.5 },
});
