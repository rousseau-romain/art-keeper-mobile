import { View, type ViewProps } from "react-native";

export type SectionProps = ViewProps;

/** Regroupement thématique de contenu — react-native-web mappe `role="region"`
 *  vers un vrai `<section>`. Ajouter un `aria-label` pour en faire un landmark
 *  nommé. Neutre côté style. */
export const Section = (props: SectionProps) => (
  <View role="region" {...props} />
);
