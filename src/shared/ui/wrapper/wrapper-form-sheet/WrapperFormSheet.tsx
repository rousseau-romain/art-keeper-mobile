import type { ViewProps } from "react-native";
import { StyleSheet, View } from "react-native";

import type { Palette } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useThemeStyles } from "@/theme/hooks/useThemeStyles";

export type WrapperFormSheetProps = ViewProps;
export const WrapperFormSheet = ({ style, ...rest }: WrapperFormSheetProps) => {
  const styles = useThemeStyles(createStyles);

  return <View style={[styles.sheet, style]} {...rest} />;
};

const createStyles = (c: Palette) =>
  StyleSheet.create({
    sheet: {
      backgroundColor: c.bg,
      padding: SpacingEnum.xl,
      gap: SpacingEnum.lg,
      width: "100%",
    },
  });
