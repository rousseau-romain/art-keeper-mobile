import { useRouter } from "expo-router";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { LoginValues } from "@/pages/app/auth/form/LoginForm";
import { useToast } from "@/shared/ui/toast/Toast";

type UseLoginSubmitParams = {
  methods: UseFormReturn<LoginValues>;
  isCreate: boolean;
};

/**
 * Owns the login/sign-up submit flow: runs the auth mutation, surfaces failures
 * as a toast, and drives the `verifyEmail` state the screen renders. Both the
 * needs-verification sign-up and the `EMAIL_NOT_VERIFIED` sign-in 403 funnel
 * into `verifyEmail`.
 */
export const useLoginSubmit = ({ methods, isCreate }: UseLoginSubmitParams) => {
  const { t: tr } = useTranslation();
  const router = useRouter();
  const { show } = useToast();
  const { signIn, signUp } = useAuth();

  // When set, the account exists but its email isn't verified yet — the screen
  // shows the "check your inbox" panel instead of the form.
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);

  const onSubmit = methods.handleSubmit(async ({ name, email, password }) => {
    try {
      if (isCreate) {
        const outcome = await signUp(name.trim(), email, password);
        if (outcome === "needs-verification") {
          setVerifyEmail(email);
          return;
        }
      } else {
        await signIn(email, password);
      }
      router.replace("/artworks");
    } catch (e) {
      // Log the raw error: an ApiError carries status/code, anything else is the
      // non-ApiError case the UI flattens into "Something went wrong".
      if (e instanceof ApiError) {
        console.warn(
          `[login] ApiError status=${e.status} code=${e.code ?? "-"} message=${
            e.message
          }`
        );
      } else {
        console.error("[login] unexpected error", e);
      }
      // The backend already emailed a verification link at sign-up; route the
      // user to the "check your inbox" panel rather than a dead-end error.
      if (e instanceof ApiError && e.code === "EMAIL_NOT_VERIFIED") {
        setVerifyEmail(email);
        return;
      }
      show(
        e instanceof ApiError ? e.message : tr("auth.genericError"),
        "error"
      );
    }
  });

  return { onSubmit, verifyEmail, setVerifyEmail };
};
