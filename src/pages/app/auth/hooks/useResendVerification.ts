import { useTranslation } from "react-i18next";

import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useToast } from "@/shared/ui/toast/Toast";

type UseResendVerificationParams = {
  /** The unverified address (from useLoginSubmit); null when not in that state. */
  email: string | null;
};

/** Re-sends the email-verification link for the link-expired case. */
export const useResendVerification = ({
  email,
}: UseResendVerificationParams) => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const { resendVerification, resendPending } = useAuth();

  const onResend = async () => {
    if (!email || resendPending) return;
    try {
      await resendVerification(email);
      show(tr("auth.verifySentToast"));
    } catch (e) {
      show(e instanceof ApiError ? e.message : tr("auth.resendFailed"));
    }
  };

  return { onResend, resendPending };
};
