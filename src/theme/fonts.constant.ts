import { Archivo_800ExtraBold } from "@expo-google-fonts/archivo";
import { HankenGrotesk_400Regular } from "@expo-google-fonts/hanken-grotesk";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";

import type { Fonts } from "./theme.types";

/** Families registered with expo-font; fontFamily strings match these keys. */
export const FONT_MAP = {
  Archivo_800ExtraBold,
  HankenGrotesk_400Regular,
  SpaceMono_400Regular,
};

/** display / body / mono families (promt/02-design-system.md §Skins — gritty). */
export const FONTS: Fonts = {
  display: "Archivo_800ExtraBold",
  body: "HankenGrotesk_400Regular",
  mono: "SpaceMono_400Regular",
};
