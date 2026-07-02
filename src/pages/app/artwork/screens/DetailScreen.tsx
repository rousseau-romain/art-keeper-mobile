import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useArtist } from "@/lib/api/artists";
import { useArtworkBySlug } from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import { ArtworkLikeButton } from "@/pages/app/artwork/components/artwork-like-button/ArtworkLikeButton";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Seo } from "@/shared/ui/seo/Seo";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type DetailScreenProps = { slug: string };

export const DetailScreen = ({ slug }: DetailScreenProps) => {
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: artwork, isLoading, isError, error } = useArtworkBySlug(slug);
  const { data: artist } = useArtist(artwork?.artistId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={ColorEnum.accent} />
      </View>
    );
  }

  if (isError || !artwork) {
    return (
      <View style={styles.centered}>
        <Icon name="RotateCw" size="xxl" color="inkMute" strokeWidth={1.6} />
        <Text
          font="body"
          size="base"
          color="inkSoft"
          style={[styles.centerText, styles.errorText]}
        >
          {error instanceof ApiError ? error.message : tr("artwork.notFound")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + SpacingEnum.xl },
      ]}
    >
      <Seo
        title={artwork.title}
        description={
          artwork.description ||
          tr("artwork.meta.descriptionFallback", { title: artwork.title })
        }
        image={artwork.imageUrl}
      />
      <Image
        source={{ uri: artwork.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.titleRow}>
        <View style={styles.titleCol}>
          <Text font="display" size="xxl" style={styles.title}>
            {artwork.title}
          </Text>
          {artist && (
            <Text font="body" size="base" color="inkSoft">
              {tr("artwork.byline", { name: artist.name })}
            </Text>
          )}
        </View>
        <ArtworkLikeButton artwork={artwork} />
      </View>
      {artwork.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {artwork.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </View>
      ) : null}
      {artwork.description && (
        <Text color="inkSoft">{artwork.description}</Text>
      )}
      <Text font="mono" size="sm">
        {artwork.latitude.toFixed(5)}, {artwork.longitude.toFixed(5)}
      </Text>
      <Button
        label={tr("artwork.edit")}
        variant="primary"
        onPress={() => router.push(`/artworks/${artwork.slug}/edit`)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ColorEnum.bg },
  content: { padding: SpacingEnum.lg, gap: SpacingEnum.lg },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SpacingEnum.xxl,
    backgroundColor: ColorEnum.bg,
  },
  centerText: { textAlign: "center" },
  errorText: { marginVertical: SpacingEnum.md },
  image: {
    width: "100%",
    height: 240,
    borderRadius: RadiusEnum.sm,
    backgroundColor: ColorEnum.surface2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SpacingEnum.md,
  },
  titleCol: { flex: 1, gap: SpacingEnum.xs },
  title: { textTransform: "uppercase" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
});
