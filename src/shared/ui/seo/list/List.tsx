import { View, type ViewProps } from "react-native";

export type ListProps = ViewProps;

/** Liste sémantique (tags, métadonnées) — react-native-web mappe `role="list"`
 *  vers un vrai `<ul>`. Pour de longues listes virtualisées, garder `FlatList`.
 *  Neutre côté style. */
export const List = (props: ListProps) => <View role="list" {...props} />;
