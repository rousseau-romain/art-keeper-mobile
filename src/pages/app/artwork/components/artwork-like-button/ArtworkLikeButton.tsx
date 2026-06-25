import { type Artwork, useToggleArtworkLike } from "@/lib/api/artworks";
import { ButtonLike } from "@/shared/ui/button/ButtonLike";

export type ArtworkLikeButtonProps = {
  artwork: Artwork;
};

export const ArtworkLikeButton = ({ artwork }: ArtworkLikeButtonProps) => {
  const toggleLike = useToggleArtworkLike();
  return (
    <ButtonLike
      liked={artwork.likedByMe}
      count={artwork.likeCount}
      onPress={() =>
        toggleLike.mutate({ id: artwork.id, liked: !artwork.likedByMe })
      }
    />
  );
};
