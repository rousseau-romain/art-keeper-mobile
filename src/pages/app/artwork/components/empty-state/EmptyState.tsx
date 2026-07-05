import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Centered } from "@/shared/ui/centered/Centered";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type EmptyStateProps = Record<string, never>;

export const EmptyState = () => {
  const { t: tr } = useTranslation();

  return (
    <Centered>
      <Icon name="MapPin" size="xxxl" color="textMuted" strokeWidth={1.6} />
      <Text font="body" size="base" color="textSoft" style={styles.text}>
        {tr("artwork.empty")}
      </Text>
    </Centered>
  );
};

const styles = StyleSheet.create({
  text: { textAlign: "center", marginTop: SpacingEnum.md },
});
