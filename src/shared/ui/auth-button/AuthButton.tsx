import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { Button, type ButtonProps } from "@/shared/ui/button/Button";

export type AuthButtonProps = Omit<
  ButtonProps,
  "label" | "onPress" | "loading" | "iconBefore"
>;

export const AuthButton = (props: AuthButtonProps) => {
  const { status, signOut } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const haptic = useHaptics();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const authed = status === "authenticated";

  const onPress = async () => {
    if (!authed) {
      router.push("/login");
      return;
    }
    setIsSigningOut(true);
    try {
      await signOut();
      haptic("success");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      {...props}
      label={authed ? t("settings.signOut") : t("auth.signIn")}
      iconBefore={{ name: authed ? "LogOut" : "LogIn" }}
      isLoading={isSigningOut}
      onPress={onPress}
    />
  );
};
