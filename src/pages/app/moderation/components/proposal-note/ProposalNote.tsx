import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type ProposalNoteProps = {
  /** The proposer's explanation for the change, or null when none was given. */
  note: string | null;
};

/**
 * The proposer's note shown under the diff — their free-text explanation of why
 * the change was proposed. Renders nothing when the proposal carries no note.
 */
export const ProposalNote = ({ note }: ProposalNoteProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);

  if (!note) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="MessageSquare" size="sm" color="textSoft" />
        <Text font="mono" size="xs" color="textSoft" style={styles.label}>
          {tr("moderation.note")}
        </Text>
      </View>
      <Text size="base" color="text">
        {note}
      </Text>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      gap: SpacingEnum.xs,
      padding: SpacingEnum.md,
      borderRadius: RadiusEnum.md,
      backgroundColor: c.surface2,
      borderWidth: 1.5,
      borderColor: c.borderSoft,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: SpacingEnum.xs,
    },
    label: { textTransform: "uppercase", letterSpacing: 0.5 },
  });
