import { useRouter } from "expo-router";
import type { GestureResponderEvent } from "react-native";
import { type Artwork, useToggleArtworkLike } from "@/lib/api/artworks";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { stopLinkActivation } from "@/shared/lib/stop-link-activation";
import { ButtonLike } from "@/shared/ui/button/ButtonLike";

export type ArtworkLikeButtonProps = {
  artwork: Artwork;
};

export const ArtworkLikeButton = ({ artwork }: ArtworkLikeButtonProps) => {
  const toggleLike = useToggleArtworkLike();
  const haptic = useHaptics();
  const router = useRouter();
  const { status } = useAuth();
  const onPress = (e: GestureResponderEvent) => {
    // The card is an `<a>` link on web (ArtworkCard) — keep a like tap from
    // bubbling to the anchor and triggering navigation.
    stopLinkActivation(e);
    // The browse/detail are public, but liking needs an account (the API's
    // like endpoint is auth-only). Route signed-out visitors to Login instead
    // of firing a request that would 401.
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    const liked = !artwork.likedByMe;
    haptic(liked ? "success" : "light");
    toggleLike.mutate({ id: artwork.id, liked });
  };
  return (
    <ButtonLike
      liked={artwork.likedByMe}
      count={artwork.likeCount}
      onPress={onPress}
    />
  );
};
