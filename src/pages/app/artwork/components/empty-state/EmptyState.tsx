import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Button } from "@/shared/ui/button/Button";
import { Centered } from "@/shared/ui/centered/Centered";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type EmptyStateProps = {
  /** True when the empty list is the result of active filters (not a bare wall). */
  filtered?: boolean;
  /** Clears the active filters — shown as a button only when `filtered`. */
  onResetFilters?: () => void;
};

export const EmptyState = ({ filtered, onResetFilters }: EmptyStateProps) => {
  const { t: tr } = useTranslation();

  return (
    <Centered style={styles.centered}>
      <Icon name="MapPin" size="xxxl" color="textMuted" strokeWidth={1.6} />
      <Text font="body" size="base" color="textSoft" style={styles.text}>
        {tr("artwork.empty")}
      </Text>
      {filtered && onResetFilters && (
        <Button
          variant="ghost"
          label={tr("artwork.emptyReset")}
          onPress={onResetFilters}
          iconBefore={{ name: "RotateCcw" }}
        />
      )}
    </Centered>
  );
};

const styles = StyleSheet.create({
  text: { textAlign: "center" },
  centered: { gap: SpacingEnum.lg },
});
