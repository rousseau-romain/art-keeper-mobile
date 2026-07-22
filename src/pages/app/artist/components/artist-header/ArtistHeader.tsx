import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import type { Artist } from "@/lib/api/artists";
import { ArtistFollowButton } from "@/pages/app/artist/components/artist-follow-button/ArtistFollowButton";
import { Avatar } from "@/shared/ui/avatar/Avatar";
import { Icon } from "@/shared/ui/icon/Icon";
import { Row } from "@/shared/ui/row/Row";
import { H1 } from "@/shared/ui/seo/h1/H1";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ArtistHeaderProps = {
  artist: Artist;
};

/**
 * The profile header: avatar, `@handle` (the page's H1) with a verified badge,
 * bio, the piece/follower counts, and the follow button.
 */
export const ArtistHeader = ({ artist }: ArtistHeaderProps) => {
  const { t: tr } = useTranslation();
  const handle = `@${artist.slug}`;

  return (
    <View style={styles.header}>
      <Avatar name={artist.name} uri={artist.avatarUrl} size="lg" />

      <View style={styles.handleRow}>
        <H1 style={styles.handle}>{handle}</H1>
        {artist.verified && (
          <Icon name="BadgeCheck" size="md" color="primary" />
        )}
      </View>

      {artist.description && (
        <Text font="body" size="base" color="textSoft">
          {artist.description}
        </Text>
      )}

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text font="mono" size="lg" color="text">
            {artist.artworkCount}
          </Text>
          <Text font="mono" size="sm" color="textMuted">
            {tr("artist.detail.pieceLabel", { count: artist.artworkCount })}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text font="mono" size="lg" color="text">
            {artist.followerCount}
          </Text>
          <Text font="mono" size="sm" color="textMuted">
            {tr("artist.detail.followerLabel", { count: artist.followerCount })}
          </Text>
        </View>
      </View>

      <ArtistFollowButton artist={artist} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { gap: SpacingEnum.md, alignItems: "flex-start" },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.xs,
  },
  handle: { textTransform: "uppercase" },
  stats: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.lg },
  stat: { flexDirection: "row", alignItems: "center", gap: SpacingEnum.xs },
});
