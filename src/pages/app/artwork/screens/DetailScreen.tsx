import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useArtist } from "@/lib/api/artists";
import {
  useArtworkBySlug,
  useArtworksByArtist,
  useNearbyArtworks,
} from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import { ArtworkHero } from "@/pages/app/artwork/components/artwork-hero/ArtworkHero";
import { ArtworkLocationBand } from "@/pages/app/artwork/components/artwork-location-band/ArtworkLocationBand";
import { ArtworkMeta } from "@/pages/app/artwork/components/artwork-meta/ArtworkMeta";
import { MoreByArtist } from "@/pages/app/artwork/components/more-by-artist/MoreByArtist";
import { NearbyPanel } from "@/pages/app/artwork/components/nearby-panel/NearbyPanel";
import { Icon } from "@/shared/ui/icon/Icon";
import { Seo } from "@/shared/ui/seo/Seo";
import { SplitRow } from "@/shared/ui/split-row/SplitRow";
import { Text } from "@/shared/ui/text/Text";
import { WrapperScrollView } from "@/shared/ui/wrapper/wrapper-scroll-view/WrapperScrollView";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type DetailScreenProps = { slug: string };

export const DetailScreen = ({ slug }: DetailScreenProps) => {
  const { t: tr } = useTranslation();
  const { wide } = useBreakpoint();
  const { data: artwork, isLoading, isError, error } = useArtworkBySlug(slug);
  const { data: artist } = useArtist(artwork?.artistId);
  const { radius, nearby } = useNearbyArtworks(artwork);
  const { artworks: moreByArtist } = useArtworksByArtist(
    artwork?.artistId ?? ""
  );
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !artwork) {
    return (
      <View style={styles.centered}>
        <Icon name="RotateCw" size="xxl" color="textMuted" strokeWidth={1.6} />
        <Text
          font="body"
          size="base"
          color="textSoft"
          style={[styles.centerText, styles.errorText]}
        >
          {error instanceof ApiError ? error.message : tr("artwork.notFound")}
        </Text>
      </View>
    );
  }

  return (
    <WrapperScrollView>
      <Seo
        title={artwork.title}
        description={
          artwork.description ||
          tr("artwork.meta.descriptionFallback", { title: artwork.title })
        }
        image={artwork.imageUrl}
      />

      <SplitRow>
        <ArtworkHero imageUrl={artwork.imageUrl} wide={wide} />
        <ArtworkMeta artwork={artwork} artist={artist} wide={wide} />
      </SplitRow>

      <SplitRow>
        <ArtworkLocationBand artwork={artwork} wide={wide} />
        <NearbyPanel artworks={nearby} radius={radius} />
      </SplitRow>

      {artist && <MoreByArtist artist={artist} artworks={moreByArtist} />}
    </WrapperScrollView>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: SpacingEnum.xxl,
      backgroundColor: c.bg,
    },
    centerText: { textAlign: "center" },
    errorText: { marginVertical: SpacingEnum.md },
  });
