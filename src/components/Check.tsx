import { Check as CheckIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme";

/** Small accent verified badge (used next to verified artists/pieces). */
export function Check({ size = 16 }: { size?: number }) {
  const { t } = useTheme();
  const { t: tr } = useTranslation();
  return (
    <View
      accessibilityLabel={tr("a11y.verified")}
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: t.accent,
        },
      ]}
    >
      <CheckIcon size={size * 0.66} color={t.accentInk} strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", justifyContent: "center" },
});
