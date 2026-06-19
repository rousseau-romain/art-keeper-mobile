import { Heart, LogOut, MapPin, RotateCw } from "lucide-react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  type Artwork,
  useArtworks,
  useToggleArtworkLike,
} from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useLocale } from "@/lib/i18n/I18nProvider";
import { Button, Tag } from "@/shared/ui";
import { FONT_SIZE, RADIUS, SPACING, useTheme } from "@/theme";

export default function BrowseScreen() {
  const { t, display, body, mono } = useTheme();
  const { t: tr } = useTranslation();
  const { language, toggleLanguage } = useLocale();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const {
    artworks,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isStale,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useArtworks();

  const toggleLike = useToggleArtworkLike();

  // RefreshControl must reflect ONLY a user-initiated pull, not the background
  // refetches that cache invalidation (e.g. after a like) triggers — otherwise
  // liking an artwork makes the pull-to-refresh spinner "wiggle". `isRefetching`
  // is true for any refetch-with-data in TanStack Query v5, so we track the
  // manual pull explicitly instead.
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setManualRefreshing(false);
    }
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // A background refetch is in flight when we're fetching but not doing the
  // first load, a manual pull-to-refresh, or a "load more". This now covers
  // the like-invalidation refetch, which surfaces as the "updating" status dot
  // rather than the pull-to-refresh spinner.
  const backgroundRefetching =
    isFetching && !isLoading && !manualRefreshing && !isFetchingNextPage;

  const header = (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + SPACING.xl,
          backgroundColor: t.bg,
          borderBottomColor: t.hair,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={display(FONT_SIZE.xxl)}>{tr("browse.title")}</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={toggleLanguage}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Language: ${language}`}
          >
            <Text
              style={[
                mono(FONT_SIZE.sm),
                styles.langLabel,
                { color: t.inkMute },
              ]}
            >
              {language}
            </Text>
          </Pressable>
          <Pressable
            onPress={signOut}
            hitSlop={8}
            accessibilityLabel={tr("browse.signOut")}
          >
            <LogOut size={20} color={t.inkMute} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>
      <View style={styles.metaRow}>
        <Text style={mono(FONT_SIZE.sm)}>
          {tr("browse.pieceCount", { count: artworks.length })}
          {hasNextPage ? "+" : ""} · {tr("browse.location")}
        </Text>
        <StatusDot
          color={
            backgroundRefetching ? t.accent : isStale ? t.inkMute : t.diffAdd
          }
          label={
            backgroundRefetching
              ? tr("browse.statusUpdating")
              : isStale
                ? tr("browse.statusStale")
                : tr("browse.statusLive")
          }
        />
      </View>
    </View>
  );

  // --- Initial load: nothing cached yet -----------------------------------
  if (isLoading) {
    return (
      <View style={[styles.flex1, { backgroundColor: t.bg }]}>
        {header}
        <Centered>
          <ActivityIndicator color={t.accent} />
          <Text style={[mono(FONT_SIZE.sm), styles.centerNote]}>
            {tr("browse.loading")}
          </Text>
        </Centered>
      </View>
    );
  }

  // --- Hard error with no data to show ------------------------------------
  if (isError && artworks.length === 0) {
    return (
      <View style={[styles.flex1, { backgroundColor: t.bg }]}>
        {header}
        <Centered>
          <RotateCw size={32} color={t.inkMute} strokeWidth={1.6} />
          <Text
            style={[
              body(FONT_SIZE.base),
              styles.centerText,
              styles.errorText,
              { color: t.inkSoft },
            ]}
          >
            {error instanceof ApiError ? error.message : tr("browse.loadError")}
          </Text>
          <Button
            label={tr("common.retry")}
            variant="primary"
            onPress={() => refetch()}
          />
        </Centered>
      </View>
    );
  }

  return (
    <View style={[styles.flex1, { backgroundColor: t.bg }]}>
      {header}
      <FlatList
        data={artworks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + SPACING.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={manualRefreshing}
            onRefresh={onRefresh}
            tintColor={t.accent}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <ArtworkCard
            artwork={item}
            onToggleLike={() =>
              toggleLike.mutate({ id: item.id, liked: !item.likedByMe })
            }
          />
        )}
        // --- Empty: loaded successfully but no rows ---
        ListEmptyComponent={
          <Centered>
            <MapPin size={36} color={t.inkMute} strokeWidth={1.6} />
            <Text
              style={[
                body(FONT_SIZE.base),
                styles.centerText,
                styles.emptyText,
                { color: t.inkSoft },
              ]}
            >
              {tr("browse.empty")}
            </Text>
          </Centered>
        }
        // --- Load-more spinner ---
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator color={t.accent} style={styles.footerSpinner} />
          ) : null
        }
      />
    </View>
  );
}

function ArtworkCard({
  artwork,
  onToggleLike,
}: {
  artwork: Artwork;
  onToggleLike: () => void;
}) {
  const { t, display, mono } = useTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: t.surface, borderColor: t.hair }]}
    >
      <Image
        source={{ uri: artwork.imageUrl }}
        style={[styles.cardImage, { backgroundColor: t.surface2 }]}
        resizeMode="cover"
      />
      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text
            style={[display(FONT_SIZE.lg), styles.cardTitle]}
            numberOfLines={2}
          >
            {artwork.title}
          </Text>
          <LikeButton
            liked={artwork.likedByMe}
            count={artwork.likeCount}
            onPress={onToggleLike}
          />
        </View>
        {artwork.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {artwork.tags.slice(0, 4).map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </View>
        ) : null}
        <Text style={mono(FONT_SIZE.xs)}>
          {artwork.latitude.toFixed(3)}, {artwork.longitude.toFixed(3)}
        </Text>
      </View>
    </View>
  );
}

function LikeButton({
  liked,
  count,
  onPress,
}: {
  liked: boolean;
  count: number;
  onPress: () => void;
}) {
  const { t, mono } = useTheme();
  const { t: tr } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={liked ? tr("browse.unlike") : tr("browse.like")}
      style={styles.likeRow}
    >
      <Heart
        size={18}
        color={liked ? t.accent : t.inkMute}
        fill={liked ? t.accent : "transparent"}
        strokeWidth={1.8}
      />
      <Text
        style={[mono(FONT_SIZE.sm), { color: liked ? t.accent : t.inkMute }]}
      >
        {count}
      </Text>
    </Pressable>
  );
}

function StatusDot({ color, label }: { color: string; label: string }) {
  const { mono } = useTheme();
  return (
    <View style={styles.statusDot}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={mono(FONT_SIZE.xs)}>{label}</Text>
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={[styles.centered, { backgroundColor: t.bg }]}>{children}</View>
  );
}

// Static, theme-independent layout only. useTheme/dynamic values stay inline above.
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
    borderBottomWidth: 1.5,
  },
  langLabel: { textTransform: "uppercase" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  listContent: { padding: SPACING.lg, gap: SPACING.lg, flexGrow: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },
  centerNote: { marginTop: SPACING.md },
  centerText: { textAlign: "center" },
  errorText: { marginVertical: SPACING.md },
  emptyText: { marginTop: SPACING.md },
  footerSpinner: { marginVertical: SPACING.md },
  card: { borderRadius: RADIUS.sm, borderWidth: 1.5, overflow: "hidden" },
  cardImage: { width: "100%", height: 180 },
  cardBody: { padding: SPACING.lg, gap: SPACING.md },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  cardTitle: { flex: 1 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  likeRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  statusDot: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
