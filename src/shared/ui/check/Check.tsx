import { Check as CheckIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, type ViewProps } from "react-native";

import type { Palette } from "@/theme/enums/color.enums";
import { FontSizeEnum, type FontSizeEnumType } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";
import { useTheme } from "@/theme/ThemeProvider";

export type CheckProps = ViewProps & {
  size?: FontSizeEnumType;
};

export const Check = ({ size = "base", style, ...rest }: CheckProps) => {
  const { t: tr } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemeStyles(createStyles);
  const px = FontSizeEnum[size];
  return (
    <View
      accessibilityLabel={tr("a11y.verified")}
      {...rest}
      style={[
        styles.badge,
        { width: px, height: px, borderRadius: px / 2 },
        style,
      ]}
    >
      <CheckIcon size={px * 0.66} color={colors.primaryInk} strokeWidth={2.4} />
    </View>
  );
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    badge: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.primary,
    },
  });
