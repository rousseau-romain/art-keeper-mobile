import * as Haptics from "expo-haptics";
import { useCallback } from "react";

/** Named haptic effects, each mapped to its native trigger. */
const effects = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  selection: () => Haptics.selectionAsync(),
} as const;

/** A named haptic effect — the key of {@link effects}. */
export type HapticName = keyof typeof effects;

/** Every haptic name, for enumeration (e.g. the dev haptics test screen). */
export const HAPTIC_NAMES = Object.keys(effects) as HapticName[];

/**
 * Returns a stable `trigger(name)` that fires a named haptic. The single entry
 * point for tactile feedback.
 */
export const useHaptics = () => {
  return useCallback((name: HapticName) => {
    void effects[name]();
  }, []);
};
