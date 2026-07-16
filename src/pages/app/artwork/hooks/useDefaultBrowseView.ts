import { useSyncExternalStore } from "react";

import {
  getBrowseView,
  getServerBrowseView,
  setBrowseView,
  subscribe,
} from "@/pages/app/artwork/browse-view-store";
import type { ArtworkView } from "@/pages/app/artwork/components/view-toggle/ViewToggle";

/**
 * Read/write the persisted *default* browse view (grid ⇄ map). Backed by the
 * platform-split `browse-view-store` (web: cookie, so the SSR render can honour
 * it; native: AsyncStorage). Both the Settings picker and the browse screen
 * consume it; the browse screen uses it only for the initial view (the in-screen
 * toggle takes over afterwards).
 */
export const useDefaultBrowseView = (): {
  view: ArtworkView;
  setView: (view: ArtworkView) => void;
} => {
  const view = useSyncExternalStore(
    subscribe,
    getBrowseView,
    getServerBrowseView,
  );
  return { view, setView: setBrowseView };
};
