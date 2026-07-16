import { useLocalSearchParams } from "expo-router";
import type {
  GenerateMetadataFunction,
  LoaderFunction,
} from "expo-router/server";
import { origin, setResponseHeaders } from "expo-server";
import { Suspense } from "react";

// Side-effect: configure the generated API client (base URL + interceptors)
// before the server-side fetch in `loader` runs. The loader resolves outside the
// React tree, so `_layout`'s import of this module may not have run.
import "@/lib/api/client";
import {
  type ArtworkPage,
  PAGE_SIZE,
  paramsToBrowseFilters,
  toTagArray,
} from "@/lib/api/artworks";
import { getArtworks } from "@/lib/api/generated/sdk.gen";
import { serverT } from "@/lib/i18n/server";
import { IndexScreen } from "@/pages/app/artwork/screens/IndexScreen";
import { ScreenFallback } from "@/shared/ui/screen-fallback/ScreenFallback";

// Page title + indexing policy, resolved server-side in the request's locale so
// the browse page ships them in the earliest HTML bytes. The browse URL's params
// don't all describe the same kind of page, so they're not treated alike:
//
// - `q` (free-text search) → an internal search-results page: unbounded, thin,
//   and near-duplicate. `noindex, follow` — crawlers still walk through to the
//   artworks it lists. `scope` only narrows `q` (see `searchFilter`), so it's
//   covered by the same branch and never appears in a canonical.
// - one `tag` → a real curated landing page with its own server-rendered list
//   (worth ranking for), so it canonicalizes to *itself* rather than folding
//   into the bare listing — which would tell Google not to index it at all.
// - several tags → a combinatorial URL space; `noindex, follow` again.
// - no params → the bare listing.
export const generateMetadata: GenerateMetadataFunction = async (request) => {
  const t = serverT(request.headers.get("accept-language"));
  const baseUrl = origin();

  const sp = new URL(request.url).searchParams;
  const q = (sp.get("q") ?? "").trim();
  // Same normalization the screen/loader filter by (trimmed, lowercased, deduped)
  // — then sorted, so `?tag=b&tag=a` can't be a second URL for one page.
  const tags = toTagArray(sp.getAll("tag")).sort();

  if (q || tags.length > 1) {
    return {
      title: t("artwork.title.index"),
      robots: { index: false, follow: true },
    };
  }

  const tag = tags[0];
  if (!tag) {
    return {
      title: t("artwork.title.index"),
      robots: { index: true, follow: true },
      alternates: {
        canonical: `${baseUrl}/artworks`,
      },
    };
  }

  return {
    title: t("artwork.meta.tagTitle", { tag }),
    description: t("artwork.meta.tagDescription", { tag }),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${baseUrl}/artworks?tag=${encodeURIComponent(tag)}`,
    },
  };
};

// Web-only, runs server-side at request time. Prefetch the first artwork page so
// the browse grid ships in the initial HTML (crawlable list + a discoverable LCP
// image) instead of a blank shell fetched only client-side. The URL's query
// params (`q` / `scope` / `tag`) are honoured via the SAME `paramsToBrowseFilters`
// the screen uses, so the SSR HTML reflects the *filtered* list and the seeded
// `initialData` attaches to the query the screen subscribes to on first render.
// The returned page is embedded in the HTML and read by `useLoaderArtworks`.
export const loader: LoaderFunction<{ page: ArtworkPage | null }> = async (
  request,
) => {
  const sp = request
    ? new URL(request.url).searchParams
    : new URLSearchParams();
  const filters = paramsToBrowseFilters(
    sp.get("q") ?? undefined,
    sp.get("scope") ?? undefined,
    sp.getAll("tag"),
  );

  try {
    // The configured client sets `throwOnError: true`, so a resolved call always
    // has `data` — same cast as the data layer (e.g. `setLike`).
    const { data } = await getArtworks({
      query: { ...filters, limit: PAGE_SIZE },
    });
    const page = data as ArtworkPage;
    // Preload the first thumbnail (grid LCP) as soon as the document arrives.
    const firstImage = page.data[0]?.imageUrl;
    if (firstImage) {
      setResponseHeaders({
        Link: `<${firstImage}>; rel=preload; as=image; fetchpriority=high`,
      });
    }
    return { page };
  } catch {
    // API unreachable: no seed/preload; the screen renders its own loading/error
    // branch from its client-side query.
    return { page: null };
  }
};

export default function Screen() {
  const { q, scope, tag } = useLocalSearchParams<{
    q?: string;
    scope?: string;
    tag?: string | string[];
  }>();
  // `IndexScreen` reads the loader page (`useLoaderArtworks` on web), which
  // suspends during client-side navigation (on initial load the data is already
  // in the HTML, so it doesn't). The boundary shows a themed spinner meanwhile.
  return (
    <Suspense fallback={<ScreenFallback />}>
      <IndexScreen initialQuery={q} initialScope={scope} initialTags={tag} />
    </Suspense>
  );
}
