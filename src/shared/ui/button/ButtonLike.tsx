import { type GestureResponderEvent, View, type ViewProps } from "react-native";
import { Button } from "./Button";
import { useButtonLikeIcon } from "./hooks/useButtonLikeIcon";

export type ButtonLikeProps = ViewProps & {
  isLiked: boolean;
  count: number;
  onPress: (event: GestureResponderEvent) => void;
};

export function ButtonLike({
  isLiked,
  count,
  onPress,
  ...rest
}: ButtonLikeProps) {
  const iconBefore = useButtonLikeIcon(isLiked);
  return (
    <View {...rest}>
      <Button
        size="sm"
        variant="text"
        onPress={onPress}
        label={count.toString()}
        iconBefore={iconBefore}
      />
    </View>
  );
}
