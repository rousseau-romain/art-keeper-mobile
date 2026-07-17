import { View, type ViewProps } from "react-native";

export type ListItemProps = ViewProps;

/** Élément de liste — react-native-web mappe `role="listitem"` vers un vrai
 *  `<li>`. À placer dans un `List`. Neutre côté style. */
export const ListItem = (props: ListItemProps) => (
  <View role="listitem" {...props} />
);
