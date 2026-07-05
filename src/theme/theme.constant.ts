/**
 * AsyncStorage key for the persisted theme mode. Lives outside ThemeProvider so
 * the web HTML shell (`src/app/+html.tsx`) can read it without importing the
 * provider (and AsyncStorage) into the static-render module graph.
 */
export const THEME_MODE_STORAGE_KEY = "artkeeper:theme-mode:v1";
