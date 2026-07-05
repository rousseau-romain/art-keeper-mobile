import { Check as CheckIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, View, type ViewProps } from "react-native";

import { ColorEnum } from "@/theme/enums/color.enums";
import { FontSizeEnum, type FontSizeEnumType } from "@/theme/enums/scale.enums";

export type CheckProps = ViewProps & {
  size?: FontSizeEnumType;
};

export const Check = ({ size = "base", style, ...rest }: CheckProps) => {
  const { t: tr } = useTranslation();
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
      <CheckIcon
        size={px * 0.66}
        color={ColorEnum.primaryInk}
        strokeWidth={2.4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ColorEnum.primary,
  },
});
