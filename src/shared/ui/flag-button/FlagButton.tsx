import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button/Button";
import { useFlag } from "@/shared/ui/flag-button/hooks/useFlag";

export type FlagButtonProps = {
  /** Entity-specific screen-reader label (e.g. "Report this artist"). */
  accessibilityLabel: string;
};

/**
 * Flag / report action for a detail rail (reporting is not wired yet). Shared by
 * the artwork and artist detail views (only the a11y label differs, so it's
 * passed in).
 */
export const FlagButton = ({ accessibilityLabel }: FlagButtonProps) => {
  const { t: tr } = useTranslation();
  const { onFlag } = useFlag();
  return (
    <Button
      size="sm"
      label={tr("common.flag")}
      iconBefore={{ name: "Flag" }}
      onPress={onFlag}
      accessibilityLabel={accessibilityLabel}
    />
  );
};
