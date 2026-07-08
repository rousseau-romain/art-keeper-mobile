import { ScrollView, type ScrollViewProps, StyleSheet } from "react-native";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type WrapperScrollViewProps = ScrollViewProps;

export const WrapperScrollView = ({
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  ...rest
}: WrapperScrollViewProps) => {
  return (
    <ScrollView
      style={[styles.screen, style]}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: SpacingEnum.lg, gap: SpacingEnum.lg },
});
