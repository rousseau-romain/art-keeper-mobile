import { View, type ViewProps } from "react-native";

export type MainProps = ViewProps;

/** Landmark du contenu principal — react-native-web mappe `role="main"` vers un
 *  vrai `<main>`. Neutre côté style ; un seul par page. */
export const Main = (props: MainProps) => <View role="main" {...props} />;
