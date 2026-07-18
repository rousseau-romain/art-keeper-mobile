import { ScrollView, type ScrollViewProps, StyleSheet } from "react-native";
import { Main } from "@/shared/ui/seo/main/Main";

/** `main` enveloppe le contenu défilant dans le landmark `<main>` — un vrai `<main>`
 *  côté web (contrairement à un `role` posé sur le `ScrollView`, qui resterait un
 *  `<div role="main">`). Le `Main` reprend le `gap` du contenu pour espacer ses
 *  enfants comme sans `main`. Un seul par page. */
export type WrapperScrollViewProps = ScrollViewProps & {
  main?: boolean;
};

export const WrapperScrollView = ({
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  main,
  children,
  ...rest
}: WrapperScrollViewProps) => {
  return (
    <ScrollView
      style={[styles.screen, style]}
      contentContainerStyle={main ? null : contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...rest}
    >
      {main ? <Main style={contentContainerStyle}>{children}</Main> : children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
