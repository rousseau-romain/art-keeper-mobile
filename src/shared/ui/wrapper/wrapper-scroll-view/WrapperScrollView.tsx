import { ScrollView, type ScrollViewProps, StyleSheet } from "react-native";
import { Main } from "@/shared/ui/seo/main/Main";

/** `isMain` enveloppe le contenu défilant dans le landmark `<main>` — un vrai `<main>`
 *  côté web (contrairement à un `role` posé sur le `ScrollView`, qui resterait un
 *  `<div role="main">`). Le `Main` reprend le `gap` du contenu pour espacer ses
 *  enfants comme sans `isMain`. Un seul par page. */
export type WrapperScrollViewProps = ScrollViewProps & {
  isMain?: boolean;
};

export const WrapperScrollView = ({
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  isMain,
  children,
  ...rest
}: WrapperScrollViewProps) => {
  return (
    <ScrollView
      style={[styles.screen, style]}
      contentContainerStyle={isMain ? null : contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...rest}
    >
      {isMain ? (
        <Main style={contentContainerStyle}>{children}</Main>
      ) : (
        children
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
