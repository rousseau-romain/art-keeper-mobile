import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button/Button";
import { useShare } from "@/shared/ui/share-button/hooks/useShare";

export type ShareButtonProps = {
  /** The entity's display name/title — the share message and web-share title. */
  title: string;
  /** The entity's in-app path (e.g. `/artists/<slug>`) — the native deep-link target. */
  path: string;
  /** Entity-specific screen-reader label (e.g. "Share this artist"). */
  accessibilityLabel: string;
};

/**
 * Share action for a detail rail — opens the OS/web share sheet for an entity
 * identified by its `title` and in-app `path`. Shared by the artwork and artist
 * detail views (only the a11y label differs, so it's passed in).
 */
export const ShareButton = ({
  title,
  path,
  accessibilityLabel,
}: ShareButtonProps) => {
  const { t: tr } = useTranslation();
  const { onShare } = useShare({ title, path });
  return (
    <Button
      size="sm"
      label={tr("common.share")}
      iconBefore={{ name: "Share" }}
      onPress={onShare}
      accessibilityLabel={accessibilityLabel}
    />
  );
};
