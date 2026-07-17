import { View, type ViewProps } from "react-native";

export type FigureProps = ViewProps;

/** Conteneur d'illustration autonome (image d'œuvre) — react-native-web mappe
 *  `role="figure"` vers un vrai `<figure>`. Neutre côté style. */
export const Figure = (props: FigureProps) => <View role="figure" {...props} />;
