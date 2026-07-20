import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import type { SearchScope } from "@/lib/api/artworks";
import { TagSourcePicker } from "@/pages/app/artwork/components/tag-source-picker/TagSourcePicker";
import { useArtworkFilters } from "@/pages/app/artwork/hooks/useArtworkFilters";
import { useFilterLabel } from "@/pages/app/artwork/hooks/useFilterLabel";
import { useReflectFiltersToUrl } from "@/pages/app/artwork/hooks/useReflectFiltersToUrl";
import { useTagDraft } from "@/pages/app/artwork/hooks/useTagDraft";
import { useTagSource } from "@/pages/app/artwork/hooks/useTagSource";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Input } from "@/shared/ui/input/Input";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import { WrapperFormSheet } from "@/shared/ui/wrapper/wrapper-form-sheet/WrapperFormSheet";
import { SpacingEnum } from "@/theme/enums/scale.enums";

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
  const { draft, setDraft, inputRef, commit } = useTagDraft();
  const { source, setSource, chips } = useTagSource();

  // Keep the URL query in sync with the filters live, without a reload (web).
  useReflectFiltersToUrl({ selectedTags, search, searchScope });

  // Custom tags = active filters that aren't suggestion chips; shown after the
  // chips so a free-form filter stays visible and removable (tap to remove).
  const customTags = selectedTags.filter((tag) => !chips.includes(tag));

  const addDraft = () => {
    commit((tag) => {
      haptic("selection");
      addTag(tag);
    });
    // Keep focus so several tags can be added in a row (this field uses
    // `submitBehavior="submit"`). Deferred twice: RN(-web) blurs the field
    // *after* the submit handler, and that blur itself lands a frame late — a
    // single rAF races it, so refocus after the next frame's layout/paint.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => inputRef.current?.focus()),
    );
  };

  return (
    <WrapperFormSheet>
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
        <TagSourcePicker value={source} onChange={setSource} />
        <View style={styles.tags}>
          {chips.map((tag) => (
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
          ref={inputRef}
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
    </WrapperFormSheet>
  );
};

const styles = StyleSheet.create({
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
