import { useTranslation } from "react-i18next";
import type { Artwork } from "@/lib/api/artworks";
import { useShareArtwork } from "@/pages/app/artwork/hooks/useShareArtwork";
import { Button } from "@/shared/ui/button/Button";

export type ArtworkShareButtonProps = {
  artwork: Artwork;
};

/** Share action for the detail rail — opens the OS/web share sheet. */
export const ArtworkShareButton = ({ artwork }: ArtworkShareButtonProps) => {
  const { t: tr } = useTranslation();
  const { onShare } = useShareArtwork(artwork);
  return (
    <Button
      size="sm"
      label={tr("artwork.detail.share")}
      iconBefore={{ name: "Share" }}
      onPress={onShare}
      accessibilityLabel={tr("a11y.share")}
    />
  );
};
