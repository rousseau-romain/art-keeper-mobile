import { View, type ViewProps } from "react-native";

export type FooterProps = ViewProps;

/** Landmark de pied de page — react-native-web mappe `role="contentinfo"` vers
 *  un vrai `<footer>`. Neutre côté style. */
export const Footer = (props: FooterProps) => (
  <View role="contentinfo" {...props} />
);
