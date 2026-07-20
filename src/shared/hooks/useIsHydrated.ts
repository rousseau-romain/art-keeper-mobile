import { useEffect, useState } from "react";
import { Platform } from "react-native";

/**
 * `false` pendant le render serveur web ET le premier render client (hydratation),
 * bascule à `true` dans un effet post-montage. Natif démarre `true` (pas de SSR).
 * Sert à gater une branche *structurelle* qui diffèrerait sinon entre le serveur
 * (aveugle au viewport) et le client desktop — p.ex. bottom tab bar ↔ WebHeader —
 * pour garder le premier render déterministe (cf. web-ssr-hydration.md).
 */
export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useState(Platform.OS !== "web");
  useEffect(() => setIsHydrated(true), []);
  return isHydrated;
};
