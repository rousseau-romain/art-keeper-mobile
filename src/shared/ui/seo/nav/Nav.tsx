import { View, type ViewProps } from "react-native";

export type NavProps = ViewProps;

/** Landmark de navigation — react-native-web mappe `role="navigation"` vers un
 *  vrai `<nav>`. Neutre côté style. */
export const Nav = (props: NavProps) => <View role="navigation" {...props} />;
