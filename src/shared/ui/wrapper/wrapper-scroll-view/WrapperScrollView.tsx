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
  // Le `gap` du contentContainer n'espace que ses enfants directs. Sous `isMain`,
  // le seul enfant direct est le `<Main>`, donc le `gap` serait inerte : on le
  // déplace sur le `<Main>` pour qu'il espace `<Article>` / sections comme sans
  // `isMain`. Le reste (padding de dégagement du header) reste sur le conteneur.
  const { gap, ...containerRest } = isMain
    ? StyleSheet.flatten(contentContainerStyle) ?? {}
    : { gap: undefined };
  return (
    <ScrollView
      style={[styles.screen, style]}
      contentContainerStyle={isMain ? containerRest : contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...rest}
    >
      {isMain ? (
        // `flexGrow` reste sur le contentContainer (ci-dessus) ET est répercuté
        // sur le `<Main>` : sans quoi le `<Main>` se dimensionnerait à son contenu
        // et un enfant en `flex: 1` (ex. la carte territoire) n'aurait pas d'espace
        // à remplir jusqu'au bas du viewport.
        <Main style={{ gap, flexGrow: containerRest.flexGrow }}>{children}</Main>
      ) : (
        children
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
});
