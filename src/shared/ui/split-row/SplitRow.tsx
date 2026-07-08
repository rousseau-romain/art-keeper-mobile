import { StyleSheet, View, type ViewProps } from "react-native";
import { SpacingEnum } from "@/theme/enums/scale.enums";
import { useBreakpoint } from "@/theme/hooks/useBreakpoint";

export type SplitRowProps = ViewProps;

/**
 * Lays two children side-by-side on a wide viewport and stacks them into a
 * column on narrow ones. Owns the breakpoint so callers don't repeat the
 * `wide ? "row" : "column"` split.
 */
export const SplitRow = ({ style, children, ...rest }: SplitRowProps) => {
  const { wide } = useBreakpoint();
  return (
    <View
      style={[
        styles.row,
        {
          flexDirection: wide ? "row" : "column",
          alignItems: wide ? "flex-start" : "stretch",
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    display: "flex",
    gap: SpacingEnum.lg,
  },
});
