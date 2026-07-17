/**
 * No-op sur natif : il n'y a pas de document. La variante web
 * (`useDocumentTitle.web.ts`) écrit `document.title` après hydratation, pour les
 * navigations client-side que `generateMetadata` (serveur only) ne couvre pas.
 */
export const useDocumentTitle = (_title?: string) => {};
