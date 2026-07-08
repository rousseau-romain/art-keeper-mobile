import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { useToast } from "@/shared/ui/toast/Toast";

/**
 * Flag / report an artwork. There is no moderation-report endpoint yet, so this
 * only surfaces a "coming soon" toast (the same pattern as edit/create). It stays
 * a hook so the real report mutation can slot in here later without touching the
 * button component.
 */
export const useFlagArtwork = () => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const haptic = useHaptics();

  const onFlag = useCallback(() => {
    haptic("light");
    show(tr("artwork.detail.flagComingSoon"), "info");
  }, [show, tr, haptic]);

  return { onFlag };
};
