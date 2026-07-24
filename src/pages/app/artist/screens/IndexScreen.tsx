import { useIsFocused } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { type ArtistListItem, useArtists } from "@/lib/api/artists";
import { ApiError } from "@/lib/api/client";
import { ArtistCard } from "@/pages/app/artist/components/artist-card/ArtistCard";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Button } from "@/shared/ui/button/Button";
import { H1 } from "@/shared/ui/seo/h1/H1";
import { Text } from "@/shared/ui/text/Text";
import { WrapperView } from "@/shared/ui/wrapper/wrapper-view/WrapperView";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type IndexScreenProps = Record<string, never>;

/**
 * The artists tab: a paginated list of `ArtistCard`s (cursor pagination via
 * `useArtists`). Renders every query state — loading, error (with retry), empty,
 * and the load-more spinner — mirroring the browse `IndexScreen`. No SSR seed
 * yet: on web the list fetches client-side (the route only ships the SEO title).
 */
export const IndexScreen = () => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  const isFocused = useIsFocused();
  useDocumentTitle(tr("artist.title.index"));

  const {
    artists,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useArtists();

  // Pull-to-refresh only reflects a user-initiated pull, not background refetches
  // (a follow invalidation) — same reasoning as the browse list.
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback<ListRenderItem<ArtistListItem>>(
    ({ item }) => <ArtistCard artist={item} />,
    []
  );

  if (isLoading) {
    return (
      <WrapperView isMain style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
        <Text color="textSoft">{tr("artist.loading")}</Text>
      </WrapperView>
    );
  }

  if (isError && artists.length === 0) {
    return (
      <WrapperView isMain style={styles.centered}>
        <Text color="textSoft">
          {error instanceof ApiError ? error.message : tr("artist.loadError")}
        </Text>
        <Button
          variant="ghost"
          label={tr("artist.retry")}
          onPress={() => refetch()}
        />
      </WrapperView>
    );
  }

  return (
    <WrapperView>
      {/* Web-only page heading. Gated on focus: this stack anchors `index`
          (unstable_settings), so a deep link to `[slug]` seeds this list BEHIND
          the detail. Emitting an <h1> while occluded would add a spurious
          "Artistes" heading to the detail's outline — so the unfocused anchor
          renders a visually identical non-heading <Text> instead (mirrors the
          artworks IndexScreen). */}
      {Platform.OS === "web" &&
        (isFocused ? (
          <H1 style={styles.title}>{tr("artist.title.index")}</H1>
        ) : (
          <Text font="display" size="xxl" style={styles.title}>
            {tr("artist.title.index")}
          </Text>
        ))}
      <FlatList
        data={artists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isManualRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text color="textSoft">{tr("artist.empty")}</Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : null
        }
      />
    </WrapperView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SpacingEnum.md,
    padding: SpacingEnum.xl,
  },
  // Uppercase to match the browse list's H1.
  title: {
    textTransform: "uppercase",
    paddingHorizontal: SpacingEnum.lg,
    paddingTop: SpacingEnum.lg,
    paddingBottom: SpacingEnum.sm,
  },
  listContent: { gap: SpacingEnum.md, padding: SpacingEnum.lg, flexGrow: 1 },
  footer: { marginVertical: SpacingEnum.md },
});
