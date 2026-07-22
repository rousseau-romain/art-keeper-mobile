import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { type Artist, useToggleArtistFollow } from "@/lib/api/artists";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button } from "@/shared/ui/button/Button";

export type ArtistFollowButtonProps = {
  artist: Artist;
};

/**
 * Follow / unfollow toggle. Optimistic via `useToggleArtistFollow`. Following
 * needs an account (the follow endpoint is auth-only), so a signed-out visitor is
 * routed to Login instead of firing a request that would 401. Mirrors
 * `ArtworkLikeButton`'s auth gate + haptic.
 */
export const ArtistFollowButton = ({ artist }: ArtistFollowButtonProps) => {
  const { t: tr } = useTranslation();
  const toggleFollow = useToggleArtistFollow();
  const haptic = useHaptics();
  const router = useRouter();
  const { status } = useAuth();

  const isFollowing = artist.followedByMe;

  const onPress = () => {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    const next = !isFollowing;
    haptic(next ? "success" : "light");
    toggleFollow.mutate({ id: artist.id, isFollowing: next });
  };

  return (
    <Button
      variant={isFollowing ? "default" : "primary"}
      label={isFollowing ? tr("artist.detail.following") : tr("artist.detail.follow")}
      iconBefore={{ name: isFollowing ? "UserCheck" : "UserPlus" }}
      isLoading={toggleFollow.isPending}
      onPress={onPress}
      accessibilityLabel={
        isFollowing ? tr("a11y.unfollow") : tr("a11y.follow")
      }
      style={styles.button}
    />
  );
};

const styles = StyleSheet.create({
  button: { alignSelf: "stretch" },
});
