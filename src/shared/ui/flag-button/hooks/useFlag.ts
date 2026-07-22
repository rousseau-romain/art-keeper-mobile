import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { useToast } from "@/shared/ui/toast/Toast";

/**
 * Flag / report an entity. Reporting isn't wired to the moderation queue yet, so
 * this only surfaces a "coming soon" toast. It stays a hook so the real report
 * mutation (`postReports`, keyed by target type/id) can slot in here later
 * without touching the button. Shared by the artwork and artist flag buttons.
 */
export const useFlag = () => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const haptic = useHaptics();

  const onFlag = useCallback(() => {
    haptic("light");
    show(tr("common.flagComingSoon"), "info");
  }, [show, tr, haptic]);

  return { onFlag };
};
