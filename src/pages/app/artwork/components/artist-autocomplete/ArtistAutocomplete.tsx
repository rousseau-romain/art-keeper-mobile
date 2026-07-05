import type { Ref } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  type TextInput as RNTextInput,
  StyleSheet,
  View,
} from "react-native";

import type { ArtistListItem } from "@/lib/api/artists";
import { ApiError } from "@/lib/api/client";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useArtistSearch } from "@/pages/app/artwork/hooks/useArtistSearch";
import { Check } from "@/shared/ui/check/Check";
import { TextInput } from "@/shared/ui/input/TextInput";
import { Text } from "@/shared/ui/text/Text";
import { useToast } from "@/shared/ui/toast/Toast";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type ArtistAutocompleteProps = {
  label: string;
  placeholder: string;
  /** Forwarded to the inner input so a previous field can `.focus()` it. */
  ref?: Ref<RNTextInput>;
  /** Return-key handler — chain the keyboard's "next" to the following field. */
  onSubmitEditing?: () => void;
};

/**
 * @handle autocomplete over verified artists. Reads/writes the form directly
 * (`artistId` + `artistHandle`) so it composes into `ArtworkForm` without
 * prop-drilling `control`. Editing after a pick clears the resolved id until a
 * new artist is selected.
 */
export const ArtistAutocomplete = ({
  ref,
  label,
  placeholder,
  onSubmitEditing,
}: ArtistAutocompleteProps) => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const { control, setValue } = useFormContext<ArtworkValues>();
  const artistId = useWatch({ control, name: "artistId" });
  const { query, setQuery, matches, isLoading, createArtist, creating } =
    useArtistSearch();
  const styles = useThemeStyles(createStyles);

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
        ref={ref}
        label={label}
        placeholder={placeholder}
        value={query}
        onChangeText={onChangeText}
        debounce={200}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={onSubmitEditing}
      />
      {showDropdown && (
        <View style={styles.dropdown}>
          {matches.map((artist) => (
            <Pressable
              key={artist.id}
              onPress={() => select(artist)}
              style={styles.row}
            >
              <Text font="mono" size="sm" color="text">
                @{artist.slug}
              </Text>
              <View style={styles.rowRight}>
                <Text font="body" size="sm" color="textMuted">
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
          <Text font="body" size="sm" color="text">
            {tr("artwork.new.details.createArtist", { name: newName })}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    field: { gap: SpacingEnum.sm },
    dropdown: {
      borderWidth: 1.5,
      borderRadius: RadiusEnum.sm,
      borderColor: c.borderSoft,
      backgroundColor: c.surface2,
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
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: SpacingEnum.sm,
    },
    create: {
      borderWidth: 1.5,
      borderRadius: RadiusEnum.sm,
      borderColor: c.borderSoft,
      backgroundColor: c.surface2,
      paddingHorizontal: SpacingEnum.md,
      paddingVertical: SpacingEnum.sm,
    },
    createPending: { opacity: 0.5 },
  });
