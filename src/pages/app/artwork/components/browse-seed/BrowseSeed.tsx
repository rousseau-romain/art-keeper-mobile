import { useLoaderArtworks } from "@/pages/app/artwork/hooks/useLoaderArtworks";
import { IndexScreen } from "@/pages/app/artwork/screens/IndexScreen";

export type BrowseSeedProps = {
  initialQuery?: string;
  initialScope?: string;
  initialTags?: string | string[];
};

/**
 * Reads the browse route's SSR loader seed and hands it to `IndexScreen`.
 *
 * The loader read lives here — not in the route's `Screen` — so it sits *inside*
 * the `LoaderErrorBoundary` the route wraps it in: when this route is rendered as
 * a seeded background anchor under a deep-linked nested sibling, `useLoaderArtworks`
 * throws on the server, and only a boundary *below* the throwing component can
 * catch it (see `LoaderErrorBoundary`). `IndexScreen` itself stays router/loader-
 * agnostic (it takes `page` as a prop).
 */
export const BrowseSeed = ({
  initialQuery,
  initialScope,
  initialTags,
}: BrowseSeedProps) => {
  const page = useLoaderArtworks();
  return (
    <IndexScreen
      page={page}
      initialQuery={initialQuery}
      initialScope={initialScope}
      initialTags={initialTags}
    />
  );
};
