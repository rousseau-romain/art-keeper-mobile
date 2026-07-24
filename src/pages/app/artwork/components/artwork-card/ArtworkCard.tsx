import { Image } from "expo-image";
import { type Href, Link } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkLikeButton } from "@/pages/app/artwork/components/artwork-like-button/ArtworkLikeButton";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type ArtworkCardProps = {
  artwork: Artwork;
  href: Href;
  hideHorizontalBorder?: boolean;
};

// `Link asChild` clones `href` + `role="link"` onto the Pressable, so on web
// react-native-web renders a real `<a href>` (crawlable, right-click-openable —
// SEO) while native keeps the normal Pressable/View layout and navigation.
//
// Memoized to avoid re-rendering every visible card when the browse list
// re-renders (e.g. a background refetch) — cheap and worth it for a list row.
const ArtworkCardBase = ({
  artwork,
  href,
  hideHorizontalBorder,
}: ArtworkCardProps) => {
  const styles = useThemeStyles(createStyles);
  return (
    <Link href={href} asChild>
      <Pressable
        style={StyleSheet.flatten([
          styles.card,
          hideHorizontalBorder ? styles.hideHorizontalBorder : null,
        ])}
      >
        {/* Zoom transition disabled: `Link.AppleZoom` (iOS 18+, experimental) is
            unstable in expo-router 56 / react-native-screens 4.25 — only the first
            push zooms, the source view is detached ~2s after the screen is covered,
            and taps are swallowed during the pop (rn-screens#3621). Re-wrap this
            <Image> in <Link.AppleZoom> (and the hero in <Link.AppleZoomTarget>,
            plus usePreventZoomTransitionDismissal in [slug]/index) once fixed. */}
        <Image
          source={{ uri: artwork.imageUrl }}
          style={styles.cardImage}
          transition={200}
        />
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text
              font="display"
              size="lg"
              style={styles.cardTitle}
              numberOfLines={2}
            >
              {artwork.title}
            </Text>
            <ArtworkLikeButton artwork={artwork} />
          </View>
          {artwork.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {artwork.tags.slice(0, 4).map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </View>
          ) : null}
          <Text font="mono" size="xs">
            {artwork.latitude.toFixed(3)}, {artwork.longitude.toFixed(3)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

export const ArtworkCard = memo(ArtworkCardBase);

const createStyles = (c: Palette) =>
  StyleSheet.create({
    hideHorizontalBorder: {
      borderLeftWidth: 0,
      borderRightWidth: 0,
    },
    card: {
      borderRadius: RadiusEnum.sm,
      borderWidth: 1.5,
      overflow: "hidden",
      backgroundColor: c.surface,
      borderColor: c.borderSoft,
    },
    cardImage: {
      width: "100%",
      height: 180,
      backgroundColor: c.surface2,
    },
    cardBody: { padding: SpacingEnum.lg, gap: SpacingEnum.md },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: SpacingEnum.md,
    },
    cardTitle: { flex: 1, textTransform: "uppercase" },
    tagRow: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
  });
