import { useFonts } from "expo-font";

import { FONT_MAP } from "../fonts.constant";

/** Loads every font family. Returns [loaded, error]. */
export function useAppFonts() {
  return useFonts(FONT_MAP);
}
