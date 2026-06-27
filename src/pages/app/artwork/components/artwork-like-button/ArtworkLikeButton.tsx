import { type Artwork, useToggleArtworkLike } from "@/lib/api/artworks";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { ButtonLike } from "@/shared/ui/button/ButtonLike";

export type ArtworkLikeButtonProps = {
  artwork: Artwork;
};

export const ArtworkLikeButton = ({ artwork }: ArtworkLikeButtonProps) => {
  const toggleLike = useToggleArtworkLike();
  const haptic = useHaptics();
  const onPress = () => {
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
