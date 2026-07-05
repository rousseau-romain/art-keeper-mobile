import { StyleSheet, View, type ViewProps } from "react-native";

import { Text } from "@/shared/ui/text/Text";
import { ColorEnum } from "@/theme/enums/color.enums";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type SettingRowProps = ViewProps & {
  label: string;
  hint: string;
};

export const SettingRow = ({
  label,
  hint,
  children,
  style,
  ...rest
}: SettingRowProps) => (
  <View {...rest} style={[styles.row, style]}>
    <View style={styles.rowText}>
      <Text font="body" size="base">
        {label}
      </Text>
      <Text font="body" size="sm" color="textSoft">
        {hint}
      </Text>
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SpacingEnum.lg,
    paddingVertical: SpacingEnum.md,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: ColorEnum.borderSoft,
  },
  rowText: { flex: 1, gap: SpacingEnum.xs },
});
