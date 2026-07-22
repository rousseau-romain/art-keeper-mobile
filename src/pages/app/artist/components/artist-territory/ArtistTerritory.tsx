import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { getInitialBrowseView } from "@/pages/app/artwork/browse-view-store";
import { ArtworkGrid } from "@/pages/app/artwork/components/artwork-grid/ArtworkGrid";
import {
  type ArtworkView,
  ViewToggle,
} from "@/pages/app/artwork/components/view-toggle/ViewToggle";
import { useDefaultBrowseView } from "@/pages/app/artwork/hooks/useDefaultBrowseView";
import { TerritoryMap } from "@/shared/map/territory-map/TerritoryMap";
import { H2 } from "@/shared/ui/seo/h2/H2";
import { Section } from "@/shared/ui/seo/section/Section";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** Height of the territory map (a map needs an explicit height inside a scroll view). */
const MAP_HEIGHT = 320;

export type ArtistTerritoryProps = {
  /** The artist's pieces — plotted on the map, or listed in the grid. */
  artworks: Artwork[];
};

/**
 * The artist's body: a Map ⇄ Grid toggle over their pieces. Map view frames every
 * pin on an OpenStreetMap territory; grid view lists the pieces as the same
 * responsive `ArtworkGrid` the browse screen uses. Renders an empty note when the
 * artist has no pieces yet.
 *
 * The initial view follows the persisted *default browse view* preference (grid ⇄
 * map, web: cookie / native: AsyncStorage), exactly like the browse `IndexScreen`
 * — falling on `grid` where none is set. The reactive `defaultView` applies it
 * post-mount (native resolves late) until the in-screen toggle takes over.
 */
export const ArtistTerritory = ({ artworks }: ArtistTerritoryProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);

  const { view: defaultView } = useDefaultBrowseView();
  const [view, setView] = useState<ArtworkView>(getInitialBrowseView);
  const viewTouched = useRef(false);
  useEffect(() => {
    if (!viewTouched.current) setView(defaultView);
  }, [defaultView]);
  const onChangeView = useCallback((next: ArtworkView) => {
    viewTouched.current = true;
    setView(next);
  }, []);

  return (
    <Section style={styles.section}>
      <View style={styles.head}>
        <H2 font="mono" size="xs" color="textMuted" style={styles.eyebrow}>
          {tr("artist.detail.territory")}
        </H2>
        <ViewToggle view={view} onChange={onChangeView} />
      </View>

      {artworks.length === 0 ? (
        <Text font="body" size="sm" color="textSoft">
          {tr("artist.detail.noPieces")}
        </Text>
      ) : view === "map" ? (
        <View style={styles.mapWrap}>
          <TerritoryMap artworks={artworks} />
        </View>
      ) : (
        <ArtworkGrid artworks={artworks} />
      )}
    </Section>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    section: { gap: SpacingEnum.md },
    head: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SpacingEnum.md,
    },
    eyebrow: { textTransform: "uppercase", letterSpacing: 1 },
    mapWrap: {
      height: MAP_HEIGHT,
      borderWidth: 1.5,
      backgroundColor: c.surface2,
      borderColor: c.borderSoft,
    },
  });
