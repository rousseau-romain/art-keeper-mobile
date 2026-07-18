import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import { ArtworkActions } from "@/pages/app/artwork/components/artwork-actions/ArtworkActions";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { H1 } from "@/shared/ui/seo/h1/H1";
import { List } from "@/shared/ui/seo/list/List";
import { ListItem } from "@/shared/ui/seo/list-item/ListItem";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtworkMetaProps = {
  artwork: Artwork;
  artist?: Artist;
  /** Wide layout: the meta sits beside the hero, so it grows via `flex`. */
  wide?: boolean;
};

export const ArtworkMeta = ({ artwork, artist, wide }: ArtworkMetaProps) => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const handle = artist ? `@${artist.slug}` : "";
  return (
    <View style={[styles.meta, wide && styles.metaWide]}>
      <H1 style={styles.title}>{artwork.title}</H1>

      {artist && (
        <Link
          href={{ pathname: "/artworks", params: { artist: artist.name } }}
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

      {artwork.tags.length > 0 ? (
        <List style={styles.tags}>
          {artwork.tags.map((tag) => (
            <ListItem key={tag}>
              <Link href={{ pathname: "/artworks", params: { tag } }} asChild>
                <Tag
                  label={tag}
                  accessibilityLabel={tr("a11y.searchTag", { tag })}
                />
              </Link>
            </ListItem>
          ))}
        </List>
      ) : null}

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
  meta: { gap: SpacingEnum.md },
  metaWide: { flex: 1 },
  title: { textTransform: "uppercase" },
  handle: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xs },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
  coords: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xs },
  proposeEdit: { alignSelf: "flex-start" },
});
