import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import type { ArtworkChangeProposal } from "@/lib/api/moderation";
import {
  buildProposalDiff,
  FIELD_LABEL_KEY,
} from "@/pages/app/moderation/proposal-diff";
import { Text } from "@/shared/ui/text/Text";
import type { ColorEnumType } from "@/theme/enums/color.enums";
import { RadiusEnum, SpacingEnum } from "@/theme/enums/scale.enums";
import { useTheme } from "@/theme/ThemeProvider";

export type ProposalListItemProps = {
  proposal: ArtworkChangeProposal;
  active: boolean;
  onPress: () => void;
};

// Proposal status → its `moderation.status.*` badge i18n key.
const STATUS_LABEL_KEY: Record<
  ArtworkChangeProposal["status"],
  | "moderation.status.pending"
  | "moderation.status.approved"
  | "moderation.status.rejected"
> = {
  pending: "moderation.status.pending",
  approved: "moderation.status.approved",
  rejected: "moderation.status.rejected",
};

/** Badge palette (fg/bg) per proposal status. */
const badgeColors = (
  status: ArtworkChangeProposal["status"],
): { fg: ColorEnumType; bg: ColorEnumType } => {
  switch (status) {
    case "approved":
      return { fg: "success", bg: "successBg" };
    case "rejected":
      return { fg: "danger", bg: "dangerBg" };
    default:
      return { fg: "textMuted", bg: "surface2" };
  }
};

/**
 * A queue card: the proposal's short id, a status badge (OPEN / APPLIED /
 * REJECTED), and a descriptor of which fields it changes (e.g. "Artist · Photo ·
 * Tags"). Tapping selects it for review; the active card is outlined.
 */
export const ProposalListItem = ({
  proposal,
  active,
  onPress,
}: ProposalListItemProps) => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();

  const shortId = `#${proposal.id.slice(0, 6)}`;
  const descriptor =
    buildProposalDiff(proposal)
      .filter((field) => field.changed)
      .map((field) => tr(FIELD_LABEL_KEY[field.key]))
      .join(" · ") || shortId;

  const badge = badgeColors(proposal.status);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tr("a11y.selectProposal")}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: active ? colors.primary : colors.borderSoft,
        },
      ]}
    >
      <View style={styles.header}>
        <Text font="mono" size="xs" color="textMuted">
          {shortId}
        </Text>
        <View style={[styles.badge, { backgroundColor: colors[badge.bg] }]}>
          <Text
            font="mono"
            size="xs"
            style={styles.badgeLabel}
            color={badge.fg}
          >
            {tr(STATUS_LABEL_KEY[proposal.status])}
          </Text>
        </View>
      </View>
      <Text size="base" color="text">
        {descriptor}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: RadiusEnum.md,
    padding: SpacingEnum.md,
    gap: SpacingEnum.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingVertical: SpacingEnum.xs,
    paddingHorizontal: SpacingEnum.sm,
    borderRadius: RadiusEnum.sm,
  },
  badgeLabel: { textTransform: "uppercase", letterSpacing: 0.5 },
});
