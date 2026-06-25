import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { EmailInput } from "@/shared/ui/input/EmailInput";
import { PasswordInput } from "@/shared/ui/input/PasswordInput";
import { TextInput } from "@/shared/ui/input/TextInput";

export type LoginValues = {
  name: string;
  email: string;
  password: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type LoginFormProps = {
  /** Create mode also asks for (and requires) a name. */
  isCreate: boolean;
};

export const LoginForm = ({ isCreate }: LoginFormProps) => {
  const { t: tr } = useTranslation();
  const { control } = useFormContext<LoginValues>();

  return (
    <>
      {isCreate ? (
        <Controller
          control={control}
          name="name"
          rules={{
            required: isCreate ? tr("auth.errors.nameRequired") : false,
          }}
          render={({ field, fieldState }) => (
            <TextInput
              label={tr("auth.nameLabel")}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              autoCapitalize="words"
              placeholder={tr("auth.namePlaceholder")}
            />
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="email"
        rules={{
          required: tr("auth.errors.emailRequired"),
          pattern: {
            value: EMAIL_PATTERN,
            message: tr("auth.errors.emailInvalid"),
          },
        }}
        render={({ field, fieldState }) => (
          <EmailInput
            label={tr("auth.emailLabel")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: tr("auth.errors.passwordRequired") }}
        render={({ field, fieldState }) => (
          <PasswordInput
            label={tr("auth.passwordLabel")}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            placeholder="••••••••"
          />
        )}
      />
    </>
  );
};
