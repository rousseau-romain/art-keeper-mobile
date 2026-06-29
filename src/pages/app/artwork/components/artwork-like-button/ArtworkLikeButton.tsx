import type { GestureResponderEvent } from "react-native";
import { type Artwork, useToggleArtworkLike } from "@/lib/api/artworks";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { stopLinkActivation } from "@/shared/lib/stop-link-activation";
import { ButtonLike } from "@/shared/ui/button/ButtonLike";

export type ArtworkLikeButtonProps = {
  artwork: Artwork;
};

export const ArtworkLikeButton = ({ artwork }: ArtworkLikeButtonProps) => {
  const toggleLike = useToggleArtworkLike();
  const haptic = useHaptics();
  const onPress = (e: GestureResponderEvent) => {
    // The card is an `<a>` link on web (ArtworkCard) — keep a like tap from
    // bubbling to the anchor and triggering navigation.
    stopLinkActivation(e);
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
