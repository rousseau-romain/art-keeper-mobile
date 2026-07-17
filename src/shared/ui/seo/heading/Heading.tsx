import { Text, type TextProps } from "@/shared/ui/text/Text";
import type { FontSizeEnumType } from "@/theme/enums/scale.enums";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingProps = TextProps & {
  level?: HeadingLevel;
};

/** Titre sémantique : sur web react-native-web convertit
 *  `accessibilityRole="header"` + `aria-level` en vrai `<h{level}>` ; sur native
 *  il pose la sémantique « header » (VoiceOver / TalkBack). La taille dérive du
 *  niveau, la police `display`, tout en restant surchargeable via `TextProps`. */
const LEVEL_SIZE: Record<HeadingLevel, FontSizeEnumType> = {
  1: "xxl",
  2: "xl",
  3: "lg",
  4: "base",
  5: "md",
  6: "sm",
};

export const Heading = ({
  level = 1,
  font = "display",
  size,
  ...rest
}: HeadingProps) => (
  <Text
    accessibilityRole="header"
    aria-level={level}
    font={font}
    size={size ?? LEVEL_SIZE[level]}
    {...rest}
  />
);
