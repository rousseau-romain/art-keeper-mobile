import { View, type ViewProps } from "react-native";

export type ArticleProps = ViewProps;

/** Contenu autonome (une œuvre) — react-native-web mappe `role="article"` vers
 *  un vrai `<article>`. Neutre côté style. */
export const Article = (props: ArticleProps) => (
  <View role="article" {...props} />
);
