import { View, type ViewProps } from "react-native";

export type BannerProps = ViewProps;

/** Landmark d'en-tête de page — react-native-web mappe `role="banner"` vers un
 *  vrai `<header>`. Neutre côté style. */
export const Banner = (props: BannerProps) => <View role="banner" {...props} />;
