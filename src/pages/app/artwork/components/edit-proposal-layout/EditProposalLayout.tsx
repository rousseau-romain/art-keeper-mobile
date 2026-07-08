import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useArtist } from "@/lib/api/artists";
import { useArtworkBySlug } from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import { EditProposalFormHost } from "@/pages/app/artwork/components/edit-proposal-form-host/EditProposalFormHost";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type EditProposalLayoutProps = {
  slug: string;
  /** The edit `<Stack>` — rendered under the shared form once data is ready. */
  children: ReactNode;
};

/**
 * Gate + data owner for the edit stack: loads the artwork (and its artist for the
 * handle prefill), shows loading / not-found states, then mounts
 * `EditProposalFormHost` so both the edit screen and the location form sheet
 * share one form. Router-agnostic — the `_layout` route passes the slug in.
 */
export const EditProposalLayout = ({
  slug,
  children,
}: EditProposalLayoutProps) => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const { data: artwork, isLoading, isError, error } = useArtworkBySlug(slug);
  const { data: artist, isLoading: artistLoading } = useArtist(
    artwork?.artistId,
  );

  if (isError || (!isLoading && !artwork)) {
    return (
      <View style={styles.centered}>
        <Icon name="RotateCw" size="xxl" color="textMuted" strokeWidth={1.6} />
        <Text
          font="body"
          size="base"
          color="textSoft"
          style={styles.centerText}
        >
          {error instanceof ApiError ? error.message : tr("artwork.notFound")}
        </Text>
      </View>
    );
  }

  // Wait for the artist too (when credited) so the handle prefills on first mount.
  if (!artwork || (artwork.artistId && artistLoading)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <EditProposalFormHost artwork={artwork} artist={artist}>
      {children}
    </EditProposalFormHost>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: SpacingEnum.md,
      padding: SpacingEnum.xxl,
      backgroundColor: c.bg,
    },
    centerText: { textAlign: "center" },
  });
