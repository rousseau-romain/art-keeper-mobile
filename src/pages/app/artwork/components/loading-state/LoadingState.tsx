import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { Centered } from "@/shared/ui/centered/Centered";
import { Text } from "@/shared/ui/text/Text";
import { useTheme } from "@/theme/ThemeProvider";

export type LoadingStateProps = Record<string, never>;

export const LoadingState = () => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();

  return (
    <Centered>
      <ActivityIndicator color={colors.primary} />
      <Text font="mono" size="sm">
        {tr("artwork.loading")}
      </Text>
    </Centered>
  );
};
