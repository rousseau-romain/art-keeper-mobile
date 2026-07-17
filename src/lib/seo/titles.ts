import type { TFunction } from "i18next";

/**
 * Le `<title>` de la page browse. Un tag unique, et rien d'autre, est une landing
 * page curatée avec son propre titre ; tout le reste — zéro tag, plusieurs tags
 * (une URL combinatoire), ou une recherche libre — retombe sur le titre du
 * listing. Même découpage que la politique d'indexation de la route : seule la
 * landing page à tag unique est indexable et se canonicalise sur elle-même.
 *
 * Prend le `t` en paramètre pour servir les deux phases : `serverT(...)` dans le
 * `generateMetadata` de `app/(tabs)/artworks/index.tsx`, `useTranslation().t` dans
 * `IndexScreen`. Les deux doivent donner le même titre, sinon la navigation
 * client-side contredirait le document initial.
 */
export const browseTitle = (
  t: TFunction,
  tags: string[],
  search?: string,
): string =>
  !search?.trim() && tags.length === 1
    ? t("artwork.meta.tagTitle", { tag: tags[0] })
    : t("artwork.title.index");
