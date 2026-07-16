import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, type ViewProps } from "react-native";

import { Button } from "@/shared/ui/button/Button";
import { Icon } from "@/shared/ui/icon/Icon";
import { Text } from "@/shared/ui/text/Text";
import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type ArtworkNotFoundProps = ViewProps;

/**
 * The detail route's not-found state: the slug matched no artwork (it was
 * removed, or the URL is wrong). Offers a way back into the browse list rather
 * than leaving the user on a dead end.
 */
export const ArtworkNotFound = ({ style, ...rest }: ArtworkNotFoundProps) => {
  const { t: tr } = useTranslation();
  const styles = useThemeStyles(createStyles);

  return (
    <View {...rest} style={[styles.screen, style]}>
      <Icon name="ImageOff" size="xxl" color="textMuted" strokeWidth={1.6} />

      <Text font="display" size="xl" color="text" style={styles.centerText}>
        {tr("artwork.notFound")}
      </Text>

      <Text font="body" size="base" color="textSoft" style={styles.centerText}>
        {tr("artwork.notFoundHint")}
      </Text>

      {/* Content navigation (a browsable listing) → a real <a href> on web. */}
      <Link href="/artworks" asChild>
        <Button
          label={tr("artwork.notFoundCta")}
          variant="primary"
          iconBefore={{ name: "ArrowLeft" }}
        />
      </Link>
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: SpacingEnum.md,
      padding: SpacingEnum.xxl,
      backgroundColor: c.bg,
    },
    centerText: { textAlign: "center" },
  });
