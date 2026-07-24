import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { getInitialBrowseView } from "@/pages/app/artwork/browse-view-store";
import { ArtworkGrid } from "@/pages/app/artwork/components/artwork-grid/ArtworkGrid";
import { MapCarousel } from "@/pages/app/artwork/components/map-carousel/MapCarousel";
import {
  type ArtworkView,
  ViewToggle,
} from "@/pages/app/artwork/components/view-toggle/ViewToggle";
import { useDefaultBrowseView } from "@/pages/app/artwork/hooks/useDefaultBrowseView";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { useSafeHeight } from "@/shared/hooks/useSafeHeight";
import { TerritoryMap } from "@/shared/map/territory-map/TerritoryMap";
import { H2 } from "@/shared/ui/seo/h2/H2";
import { Section } from "@/shared/ui/seo/section/Section";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

/** Minimum height of the territory map — it grows to fill the viewport, never below this. */
const MAP_MIN_HEIGHT = 500;

export type ArtistTerritoryProps = {
  /** The artist's pieces — plotted on the map, or listed in the grid. */
  artworks: Artwork[];
  /** The artist's name — titles the section ("Artworks from {name}"). */
  artistName: string;
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
export const ArtistTerritory = ({
  artworks,
  artistName,
}: ArtistTerritoryProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);
  const haptic = useHaptics();
  const { contentPadding } = useSafeHeight();

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

  // Selection is owned here and shared by the map and the strip — the same split
  // as the browse `IndexScreen` (map `onSelect` sets it, `MapCarousel` centers on
  // it). Tapping a pin selects; the strip's thumbs are links to the piece.
  const [selectedId, setSelectedId] = useState<string>();
  const onSelect = useCallback(
    (artwork: Artwork) => {
      haptic("selection");
      setSelectedId(artwork.id);
    },
    [haptic]
  );

  return (
    <Section style={styles.section}>
      <View style={styles.head}>
        <H2 font="mono" size="xs" color="textMuted" style={styles.eyebrow}>
          {tr("artist.detail.artworksBy", { name: artistName })}
        </H2>
        <ViewToggle view={view} onChange={onChangeView} />
      </View>

      {artworks.length === 0 ? (
        <Text font="body" size="sm" color="textSoft">
          {tr("artist.detail.noPieces")}
        </Text>
      ) : view === "map" ? (
        <View style={styles.mapWrap}>
          <TerritoryMap
            artworks={artworks}
            selectedId={selectedId}
            onSelect={onSelect}
          />
          <View
            style={[
              styles.carousel,
              Platform.OS !== "web" && {
                bottom: contentPadding.paddingBottom,
                paddingBottom: SpacingEnum.xs,
              },
            ]}
            pointerEvents="box-none"
          >
            <MapCarousel artworks={artworks} selectedId={selectedId} />
          </View>
        </View>
      ) : (
        <ArtworkGrid
          artworks={artworks}
          style={
            Platform.OS !== "web" && {
              paddingBottom: contentPadding.paddingBottom,
            }
          }
        />
      )}
    </Section>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    // `flex: 1` : la section (dernier bloc du `<main>`) absorbe la hauteur restante
    // du viewport, que sa carte remplit ensuite.
    section: { flex: 1, gap: SpacingEnum.md },
    head: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SpacingEnum.md,
      paddingHorizontal: SpacingEnum.lg,
    },
    eyebrow: { textTransform: "uppercase", letterSpacing: 1 },
    mapWrap: {
      // Remplit la hauteur restante de la section (jusqu'au bas du viewport, sous
      // la tab bar flottante), sans jamais descendre sous le plancher.
      flex: 1,
      minHeight: MAP_MIN_HEIGHT,
      backgroundColor: c.surface2,
      borderColor: c.borderSoft,
    },
    carousel: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },
  });
