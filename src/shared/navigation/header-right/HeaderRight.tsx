import type { PropsWithChildren } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { SpacingEnum } from "@/theme/enums/scale.enums";

export type HeaderRightProps = PropsWithChildren;

/**
 * Row wrapper for a Stack `headerRight`. On web the JS header only insets the
 * right container by `insets.right` (0 on mobile web), so the buttons sit flush
 * to the screen edge; add a right padding there to mirror the title's 16px
 * margin. Native headers already pad the trailing area, so the padding is
 * web-only.
 */
export const HeaderRight = ({ children }: HeaderRightProps) => (
  <View style={styles.right}>{children}</View>
);

const styles = StyleSheet.create({
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: SpacingEnum.sm,
    ...Platform.select({ web: { paddingRight: SpacingEnum.lg } }),
  },
});
