import { useFonts } from "expo-font";

import { FONT_MAP } from "@/theme/fonts.constant";

/** Loads every font family. Returns [loaded, error]. */
export const useAppFonts = () => {
  return useFonts(FONT_MAP);
};
