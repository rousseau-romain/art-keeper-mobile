import { useIsFocused, useLocalSearchParams } from "expo-router";
import type {
  GenerateMetadataFunction,
  LoaderFunction,
} from "expo-router/server";
import { setResponseHeaders } from "expo-server";
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
import { forwardedCookie } from "@/lib/api/ssr-auth";
import { serverT } from "@/lib/i18n/server";
import { requestOrigin } from "@/lib/seo/request-origin";
import { browseTitle } from "@/lib/seo/titles";
import { BrowseSeed } from "@/pages/app/artwork/components/browse-seed/BrowseSeed";
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
  const baseUrl = requestOrigin();

  const sp = new URL(request.url).searchParams;
  const q = (sp.get("q") ?? "").trim();
  // Same normalization the screen/loader filter by (trimmed, lowercased, deduped)
  // — then sorted, so `?tag=b&tag=a` can't be a second URL for one page.
  const tags = toTagArray(sp.getAll("tag")).sort();

  if (q || tags.length > 1) {
    return {
      title: browseTitle(t, tags, q),
      robots: { index: false, follow: true },
    };
  }

  const tag = tags[0];
  if (!tag) {
    return {
      title: browseTitle(t, tags, q),
      robots: { index: true, follow: true },
      alternates: {
        canonical: `${baseUrl}/artworks`,
      },
    };
  }

  return {
    title: browseTitle(t, tags, q),
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
//
// The fetch runs as the caller (forwarded session cookie), so a signed-in user's
// own unverified pieces and their `likedByMe` are in the HTML rather than missing
// until the client refetches. The seed still MUST stay backdated
// (`initialDataUpdatedAt: 0`) — the mount refetch is what reconciles this page
// with the live list, and a fresh seed would skip it. See the web-ssr-hydration rule.
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
  // Per-call, never on the shared client — see `forwardedCookie`.
  const headers = forwardedCookie(request);

  // Authenticated → a personalized document (the caller's unverified pieces, their
  // `likedByMe`, their signed-in chrome). Declare it uncacheable at the origin so no
  // CDN can serve it onward; Cloudflare's cookie bypass rule is the other half.
  if (headers) setResponseHeaders({ "Cache-Control": "private, no-store" });

  try {
    // The configured client sets `throwOnError: true`, so a resolved call always
    // has `data` — same cast as the data layer (e.g. `setLike`).
    const { data } = await getArtworks({
      query: { ...filters, limit: PAGE_SIZE },
      headers,
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
  const focused = useIsFocused();

  // This route is *also* rendered as the stack's seeded background anchor beneath a
  // deep-linked nested sibling (`/artworks/[slug]/edit`, via
  // `unstable_settings.initialRouteName`). There the server never prefetched this
  // route's loader, so reading it (`useLoaderArtworks`, in `BrowseSeed`) suspends on
  // a relative server `fetch` that rejects and fails the whole document ("Switched
  // to client rendering…"). That anchor is occluded and never focused, so only mount
  // the loader-reading `BrowseSeed` when this route is actually focused; otherwise
  // render the screen loader-less (the client fetches client-side if it's ever
  // shown). `useIsFocused` derives from the URL, so it's the same on the server and
  // the client's first render — the branch is hydration-safe.
  //
  // When focused, `BrowseSeed` reads the SSR seed and suspends on client-side
  // navigation — the `<Suspense>` shows a themed spinner meanwhile.
  return (
    <Suspense fallback={<ScreenFallback />}>
      {focused ? (
        <BrowseSeed initialQuery={q} initialScope={scope} initialTags={tag} />
      ) : (
        <IndexScreen
          page={undefined}
          initialQuery={q}
          initialScope={scope}
          initialTags={tag}
        />
      )}
    </Suspense>
  );
}
