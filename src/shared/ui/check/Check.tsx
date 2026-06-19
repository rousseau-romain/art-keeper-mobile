import { Check as CheckIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, type ViewProps } from "react-native";

import { FONT_SIZE, type FontSize, useTheme } from "@/theme";

// Wraps a View and forwards the rest of its props to it.
type CheckProps = ViewProps & {
  size?: FontSize;
};

/** Small accent verified badge (used next to verified artists/pieces). */
export const Check = ({ size = "base", style, ...rest }: CheckProps) => {
  const { t } = useTheme();
  const { t: tr } = useTranslation();
  const px = FONT_SIZE[size];
  return (
    <View
      accessibilityLabel={tr("a11y.verified")}
      {...rest}
      style={[
        styles.badge,
        {
          width: px,
          height: px,
          borderRadius: px / 2,
          backgroundColor: t.accent,
        },
        style,
      ]}
    >
      <CheckIcon size={px * 0.66} color={t.accentInk} strokeWidth={2.4} />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { alignItems: "center", justifyContent: "center" },
});
