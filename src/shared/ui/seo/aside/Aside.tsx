import { View, type ViewProps } from "react-native";

export type AsideProps = ViewProps;

/** Contenu complémentaire (barre latérale) — react-native-web mappe
 *  `role="complementary"` vers un vrai `<aside>`. Neutre côté style. */
export const Aside = (props: AsideProps) => (
  <View role="complementary" {...props} />
);
