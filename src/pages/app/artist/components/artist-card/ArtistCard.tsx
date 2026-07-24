import { Image } from "expo-image";
import { Link } from "expo-router";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import type { ArtistListItem } from "@/lib/api/artists";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import {
  ControlHeightEnum,
  RadiusEnum,
  SpacingEnum,
} from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type ArtistCardProps = {
  artist: ArtistListItem;
};

// `Link asChild` clones `href` + `role="link"` onto the Pressable, so web renders
// a real crawlable `<a href>` and native keeps the Pressable. Memoized so a
// background refetch of the list doesn't re-render every visible row.
const ArtistCardBase = ({ artist }: ArtistCardProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);

  const meta = `${artist.artworkCount} ${tr("artist.detail.pieceLabel", {
    count: artist.artworkCount,
  })} · ${artist.followerCount} ${tr("artist.detail.followerLabel", {
    count: artist.followerCount,
  })}`;

  return (
    <Link href={`/artists/${artist.slug}`} asChild>
      <Pressable style={styles.card} accessibilityLabel={artist.name}>
        {artist.avatarUrl ? (
          <Image
            source={{ uri: artist.avatarUrl }}
            style={styles.avatar}
            transition={200}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Icon name="User" size="md" color="textMuted" />
          </View>
        )}

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text
              font="display"
              size="lg"
              numberOfLines={1}
              style={styles.name}
            >
              {artist.name}
            </Text>
            {artist.verified && (
              <Icon name="BadgeCheck" size="sm" color="primary" />
            )}
          </View>
          <Text font="mono" size="xs" color="textMuted" numberOfLines={1}>
            {meta}
          </Text>
        </View>

        <Icon name="ChevronRight" size="md" color="textMuted" />
      </Pressable>
    </Link>
  );
};

export const ArtistCard = memo(ArtistCardBase);

const AVATAR = ControlHeightEnum.lg;

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: SpacingEnum.md,
      padding: SpacingEnum.md,
      borderWidth: 1.5,
      borderRadius: RadiusEnum.md,
      backgroundColor: c.surface,
      borderColor: c.borderSoft,
    },
    avatar: {
      width: AVATAR,
      height: AVATAR,
      borderRadius: RadiusEnum.full,
      backgroundColor: c.surface2,
    },
    avatarFallback: { alignItems: "center", justifyContent: "center" },
    body: { flex: 1, gap: SpacingEnum.xs },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SpacingEnum.xs,
    },
    name: { flexShrink: 1 },
  });
