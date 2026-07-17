import { useIsFocused } from "expo-router";
import { useEffect } from "react";

/**
 * Publie le `<title>` de l'écran focalisé, côté client uniquement.
 *
 * `generateMetadata` ne résout le `<head>` qu'au rendu du document : expo-router
 * ne le rejoue jamais côté client (le bundle se contente de valider l'export), et
 * le filet de React Navigation est désactivé en dur (`documentTitle: { enabled:
 * false }` dans `ExpoRoot`). Sans ce hook, naviguer d'une œuvre à l'autre laisse
 * le titre de la première dans l'onglet.
 *
 * Trois choix portants :
 * - **Un effet, jamais un render** — ne tourne ni au rendu serveur ni au premier
 *   render client, donc aucun risque de mismatch d'hydratation (#418).
 * - **`undefined` ne touche à rien** — pendant le chargement le titre SSR reste
 *   en place au lieu de flasher un libellé générique.
 * - **Gaté sur le focus** — dans un Stack l'écran précédent reste monté : sans ce
 *   garde, un refetch en arrière-plan du détail réécrirait le titre par-dessus
 *   l'écran d'édition. Il offre aussi le retour arrière gratuitement (refocus →
 *   l'effet rejoue → le titre est restauré).
 */
export const useDocumentTitle = (title?: string) => {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && title) document.title = title;
  }, [isFocused, title]);
};
