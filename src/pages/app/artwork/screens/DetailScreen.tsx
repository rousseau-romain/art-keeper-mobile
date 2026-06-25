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
import { useArtwork } from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import { ArtworkLikeButton } from "@/pages/app/artwork/components/artwork-like-button/ArtworkLikeButton";
import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Tag } from "@/shared/ui/tag/Tag";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";

export type DetailScreenProps = { id: string };

export const DetailScreen = ({ id }: DetailScreenProps) => {
  const { t: tr } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: artwork, isLoading, isError, error } = useArtwork(id);

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
      <Image
        source={{ uri: artwork.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.titleRow}>
        <Text font="display" size="xxl" style={styles.title}>
          {artwork.title}
        </Text>
        <ArtworkLikeButton artwork={artwork} />
      </View>
      {artwork.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {artwork.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </View>
      ) : null}
      <Text font="mono" size="sm">
        {artwork.latitude.toFixed(5)}, {artwork.longitude.toFixed(5)}
      </Text>
      <Button
        label={tr("artwork.edit")}
        variant="primary"
        onPress={() => router.push(`/artworks/${artwork.id}/edit`)}
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
  title: { flex: 1, textTransform: "uppercase" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: SpacingEnum.sm },
});
