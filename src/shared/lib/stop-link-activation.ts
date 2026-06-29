import type { GestureResponderEvent } from "react-native";

/**
 * Inside a `<Link asChild>` anchor, keep a nested interactive control's press
 * from bubbling up to the anchor and triggering navigation.
 *
 * Only matters on web (the card renders as a real `<a href>`, so a DOM click
 * bubbles to it); a harmless no-op on native, where the touch goes straight to
 * the innermost responder and never reaches the parent. Call it first in the
 * `onPress` of any control rendered inside a linked card.
 */
export const stopLinkActivation = (e: GestureResponderEvent) => {
  e.preventDefault();
  e.stopPropagation();
};
