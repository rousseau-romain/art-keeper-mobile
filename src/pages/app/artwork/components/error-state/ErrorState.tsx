import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { ApiError } from "@/lib/api/client";
import { Button } from "@/shared/ui/button/Button";
import { Centered } from "@/shared/ui/centered/Centered";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type ErrorStateProps = {
  error: unknown;
  onRetry: () => void;
};

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  const { t: tr } = useTranslation();

  return (
    <Centered style={styles.container}>
      <Icon name="RotateCw" size="xxl" color="textMuted" />
      <Text font="body" size="base" color="textSoft">
        {error instanceof ApiError ? error.message : tr("artwork.loadError")}
      </Text>
      <Button
        style={styles.retry}
        label={tr("common.retry")}
        variant="primary"
        onPress={onRetry}
      />
    </Centered>
  );
};

const styles = StyleSheet.create({
  container: { gap: SpacingEnum.md },
  retry: { marginHorizontal: "auto" },
});
