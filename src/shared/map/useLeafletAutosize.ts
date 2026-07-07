import type { Map as LeafletMap } from "leaflet";
import { useEffect } from "react";

/**
 * Fixes Leaflet's initial 0-height race inside a flex container: the map often
 * mounts at 0-height, so clicks are ignored / tiles don't fill the view until it
 * re-measures. Calls `invalidateSize` on mount, on a couple of delayed ticks, and
 * on every container resize.
 *
 * Pass `onMeasure` to run extra work right after each re-measure — e.g.
 * re-deriving zoom/pan bounds from the now-correct container size (the browse map
 * clamps its min zoom to the world this way). Memoize it (`useCallback`) so the
 * effect doesn't re-subscribe every render. Shared by every react-leaflet map.
 */
export const useLeafletAutosize = (
  map: LeafletMap,
  onMeasure?: () => void,
): void => {
  useEffect(() => {
    const apply = () => {
      map.invalidateSize();
      onMeasure?.();
    };
    apply();
    const t1 = setTimeout(apply, 150);
    const t2 = setTimeout(apply, 500);
    const ro = new ResizeObserver(apply);
    ro.observe(map.getContainer());
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
    };
  }, [map, onMeasure]);
};
