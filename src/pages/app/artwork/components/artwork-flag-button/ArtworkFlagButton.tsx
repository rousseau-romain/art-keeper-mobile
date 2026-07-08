import { useTranslation } from "react-i18next";
import { useFlagArtwork } from "@/pages/app/artwork/hooks/useFlagArtwork";
import { Button } from "@/shared/ui/button/Button";

/** Flag / report action for the detail rail (reporting is not wired yet). */
export const ArtworkFlagButton = () => {
  const { t: tr } = useTranslation();
  const { onFlag } = useFlagArtwork();
  return (
    <Button
      size="sm"
      label={tr("artwork.detail.flag")}
      iconBefore={{ name: "Flag" }}
      onPress={onFlag}
      accessibilityLabel={tr("a11y.flag")}
    />
  );
};
