/**
 * AsyncStorage key for the persisted theme mode (native). Lives outside
 * ThemeProvider so the web HTML shell (`src/app/+html.tsx`) can read it without
 * importing the provider (and AsyncStorage) into the static-render module graph.
 */
export const THEME_MODE_STORAGE_KEY = "artkeeper:theme-mode:v1";

/**
 * Cookie name for the persisted theme mode on **web**. Unlike localStorage, a
 * cookie is sent with the document request, so the SSR render can read the user's
 * chosen mode and render matching colors — no dark→light flash on hydration for an
 * explicit light/dark choice. (Cookie names can't contain `:`, hence the plain name.)
 */
export const THEME_MODE_COOKIE = "theme-mode";
