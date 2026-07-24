import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkActions } from "@/pages/app/artwork/components/artwork-actions/ArtworkActions";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { H1 } from "@/shared/ui/seo/h1/H1";
import { TagList } from "@/shared/ui/tag-list/TagList";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtworkMetaProps = {
  artwork: Artwork;
  artist?: Artist;
  /** Wide layout: the meta sits beside the hero, so it grows via `flex`. */
  isWide?: boolean;
};

export const ArtworkMeta = ({ artwork, artist, isWide }: ArtworkMetaProps) => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const handle = artist ? `@${artist.slug}` : "";
  return (
    <View style={[styles.meta, isWide && styles.metaWide]}>
      <H1 style={styles.title}>{artwork.title}</H1>

      {artist && (
        <Link
          href={{ pathname: "/artists/[slug]", params: { slug: artist.slug } }}
          asChild
        >
          <Pressable
            style={styles.handle}
            accessibilityLabel={tr("a11y.viewProfile", { handle })}
          >
            <Text font="body" size="base" color="primary">
              {handle}
            </Text>
            {artist.verified && (
              <Icon name="BadgeCheck" size="sm" color="primary" />
            )}
          </Pressable>
        </Link>
      )}

      <TagList tags={artwork.tags} />

      {artwork.description && (
        <Text color="textSoft">{artwork.description}</Text>
      )}

      <View style={styles.coords}>
        <Icon name="MapPin" size="xs" color="textMuted" />
        <Text font="mono" size="sm" color="textMuted">
          {artwork.latitude.toFixed(3)}, {artwork.longitude.toFixed(3)}
        </Text>
      </View>

      <ArtworkActions artwork={artwork} />

      <Button
        variant="text"
        size="sm"
        label={tr("artwork.detail.proposeEdit")}
        style={styles.proposeEdit}
        onPress={() =>
          router.push({
            pathname: "/artworks/[slug]/edit",
            params: { slug: artwork.slug },
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  meta: { gap: SpacingEnum.md, paddingHorizontal: SpacingEnum.lg },
  metaWide: { flex: 1 },
  title: { textTransform: "uppercase" },
  handle: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xs },
  coords: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xs },
  proposeEdit: { alignSelf: "flex-start" },
});
