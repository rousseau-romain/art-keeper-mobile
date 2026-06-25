import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/shared/ui/toast/Toast";

/** Google OAuth sign-in: navigates on success, toasts on failure/unavailable. */
export const useGoogleSignIn = () => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { show } = useToast();
  const { signInWithGoogle, googlePending } = useAuth();

  const onGoogle = async () => {
    try {
      const outcome = await signInWithGoogle();
      if (outcome === "unavailable") {
        show(tr("auth.googleUnavailable"));
        return;
      }
      if (outcome === "success") {
        router.replace("/artworks");
      }
      // "cancelled": user backed out — leave them on the login screen.
    } catch (e) {
      show(
        e instanceof ApiError ? e.message : tr("auth.googleFailed"),
        "error",
      );
    }
  };

  return { onGoogle, googlePending };
};
