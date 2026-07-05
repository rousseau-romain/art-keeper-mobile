import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { SearchScope } from "@/lib/api/artworks";
import { useArtworkFilters } from "@/pages/app/artwork/hooks/useArtworkFilters";
import { useFilterLabel } from "@/pages/app/artwork/hooks/useFilterLabel";
import { ARTWORK_TAG_PRESETS } from "@/pages/app/artwork/tags.constant";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Input } from "@/shared/ui/input/Input";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

// Widened view of the preset tuple so `.includes(aString)` type-checks.
const PRESETS: readonly string[] = ARTWORK_TAG_PRESETS;

// The single-select search scopes, in display order: "all" (title OR artist via
// the API's `q`), then the two single-field narrows.
const SEARCH_SCOPES = [
  { scope: "all", labelKey: "artwork.filters.scopeAll" },
  { scope: "title", labelKey: "artwork.filters.scopeTitle" },
  { scope: "artist", labelKey: "artwork.filters.scopeArtist" },
] as const satisfies readonly { scope: SearchScope; labelKey: string }[];

/**
 * The artwork tag-filter form sheet (the `(formsheet)/filters` route). Renders the
 * preset tag chips over the shared `useArtworkFilters` store, so toggling here
 * updates the browse list live. Content-sized (no `flex: 1`) to suit the sheet's
 * `fitToContents` detent.
 */
export const FilterFormSheetScreen = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const haptic = useHaptics();
  const {
    selectedTags,
    search,
    searchScope,
    count,
    toggleTag,
    addTag,
    setSearch,
    setSearchScope,
    clear,
  } = useArtworkFilters();
  const { applied: appliedLabel } = useFilterLabel(count);
  const [draft, setDraft] = useState("");
  const styles = useThemeStyles(createStyles);

  // Custom tags = active filters that aren't preset chips; shown after the
  // presets so a free-form filter stays visible and removable (tap to remove).
  const customTags = selectedTags.filter((tag) => !PRESETS.includes(tag));

  const addDraft = () => {
    const tag = draft.trim().toLowerCase();
    if (tag) {
      haptic("selection");
      addTag(tag);
    }
    setDraft("");
  };

  return (
    <View
      style={[styles.sheet, { paddingBottom: insets.bottom + SpacingEnum.xl }]}
    >
      <View style={styles.header}>
        <Text font="display" size="xl" style={styles.title}>
          {tr("artwork.filters.title")}
        </Text>
        {appliedLabel && (
          <Text font="mono" size="sm" color="textMuted">
            {appliedLabel}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text font="mono" size="sm" color="textMuted" style={styles.label}>
          {tr("artwork.filters.searchLabel")}
        </Text>
        <View style={styles.tags}>
          {SEARCH_SCOPES.map(({ scope, labelKey }) => (
            <Tag
              key={scope}
              label={tr(labelKey)}
              state={searchScope === scope ? "solid" : "muted"}
              onPress={() => {
                haptic("selection");
                setSearchScope(scope);
              }}
            />
          ))}
        </View>
        <Input
          value={search}
          onChangeText={setSearch}
          debounce={300}
          placeholder={tr("artwork.filters.searchPlaceholder")}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <View style={styles.section}>
        <Text font="mono" size="sm" color="textMuted" style={styles.label}>
          {tr("artwork.filters.tagsLabel")}
        </Text>
        <View style={styles.tags}>
          {ARTWORK_TAG_PRESETS.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              state={selectedTags.includes(tag) ? "solid" : "muted"}
              onPress={() => {
                haptic("selection");
                toggleTag(tag);
              }}
            />
          ))}
          {customTags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              state="solid"
              onPress={() => {
                haptic("selection");
                toggleTag(tag);
              }}
            />
          ))}
        </View>
        <Input
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={addDraft}
          placeholder={tr("artwork.filters.addPlaceholder")}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          submitBehavior="submit"
        />
      </View>

      <View style={styles.actions}>
        <Button
          label={tr("artwork.filters.clear")}
          variant="ghost"
          onPress={() => {
            haptic("light");
            clear();
          }}
          disabled={count === 0}
        />
        <Button
          label={tr("artwork.filters.done")}
          variant="primary"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    sheet: {
      backgroundColor: c.bg,
      paddingTop: SpacingEnum.xl,
      paddingHorizontal: SpacingEnum.xl,
      gap: SpacingEnum.lg,
      flex: 1,
    },
    header: { gap: SpacingEnum.xs },
    title: { textTransform: "uppercase" },
    section: { gap: SpacingEnum.sm },
    label: { textTransform: "uppercase" },
    tags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SpacingEnum.sm,
    },
    actions: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
  });
