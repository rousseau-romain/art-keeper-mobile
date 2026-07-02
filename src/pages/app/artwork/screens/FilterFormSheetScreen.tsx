import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useArtworkFilters } from "@/pages/app/artwork/hooks/useArtworkFilters";
import { useFilterLabel } from "@/pages/app/artwork/hooks/useFilterLabel";
import { ARTWORK_TAG_PRESETS } from "@/pages/app/artwork/tags.constant";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

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
  const { selectedTags, count, toggleTag, clear } = useArtworkFilters();
  const { applied: appliedLabel } = useFilterLabel(count);

  return (
    <View
      style={[styles.sheet, { paddingBottom: insets.bottom + SpacingEnum.xl }]}
    >
      <View style={styles.header}>
        <Text font="display" size="xl" style={styles.title}>
          {tr("artwork.filters.title")}
        </Text>
        {appliedLabel && (
          <Text font="mono" size="sm" color="inkMute">
            {appliedLabel}
          </Text>
        )}
      </View>

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

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: ColorEnum.bg,
    paddingTop: SpacingEnum.xl,
    paddingHorizontal: SpacingEnum.xl,
    gap: SpacingEnum.lg,
    flex: 1,
  },
  header: { gap: SpacingEnum.xs },
  title: { textTransform: "uppercase" },
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
