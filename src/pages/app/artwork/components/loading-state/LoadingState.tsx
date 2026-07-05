import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { Centered } from "@/shared/ui/centered/Centered";
import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";

export type LoadingStateProps = Record<string, never>;

export const LoadingState = () => {
  const { t: tr } = useTranslation();

  return (
    <Centered>
      <ActivityIndicator color={ColorEnum.primary} />
      <Text font="mono" size="sm">
        {tr("artwork.loading")}
      </Text>
    </Centered>
  );
};
