import { useLocalSearchParams } from "expo-router";
import type {
  GenerateMetadataFunction,
  LoaderFunction,
} from "expo-router/server";
import { setResponseHeaders } from "expo-server";
import { Suspense } from "react";

// Side-effect: configure the generated API client (base URL + interceptors)
// before the server-side fetch in `generateMetadata` runs. Metadata resolves
// outside the React tree, so `_layout`'s import of this module may not have run.
import "@/lib/api/client";
import type { Artist } from "@/lib/api/artists";
import {
  type Artwork,
  type ArtworkPage,
  NEARBY_RADIUS,
  PAGE_SIZE,
} from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import {
  getArtistsById,
  getArtworks,
  getArtworksSlugBySlug,
} from "@/lib/api/generated/sdk.gen";
import { forwardedCookie } from "@/lib/api/ssr-auth";
import { serverT } from "@/lib/i18n/server";
import { requestOrigin } from "@/lib/seo/request-origin";
import { useLoaderArtwork } from "@/pages/app/artwork/hooks/useLoaderArtwork";
import { DetailScreen } from "@/pages/app/artwork/screens/DetailScreen";
import { ScreenFallback } from "@/shared/ui/screen-fallback/ScreenFallback";

// Fetch an artwork by slug, mapping "no such slug" to `undefined` instead of a
// throw. The configured client sets `throwOnError: true`, so the backend's 404
// arrives as a rejected `ApiError` — left unhandled it fails the whole loader
// (a 500 on every unknown slug). Any other error (API down, 5xx) still throws,
// so a real outage isn't silently reported to users as "not found".
//
// `headers` carries the caller's forwarded cookie (see `forwardedCookie`). The
// endpoint is public but applies visibility per caller: an unverified artwork is
// readable only by its owner and admins, 404 to everyone else. So the 404 branch
// now covers two cases — a slug that exists for nobody, and a piece this caller
// may not see. Both render the same not-found, which is the truth for each.
const fetchArtworkBySlug = async (
  slug: string,
  headers?: { cookie: string }
): Promise<Artwork | undefined> => {
  try {
    const { data } = await getArtworksSlugBySlug({ path: { slug }, headers });
    return data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return undefined;
    throw e;
  }
};

// Resolve the page's SEO/Open Graph tags from the live artwork at request time
// (server rendering), so social crawlers — which don't run the client JS the old
// `<Seo>`/`expo-router/head` relied on — see the real title, description, and
// image. Runs on the server only; the screen still renders its own states.
//
// Every og:/twitter: tag below is spelled out on purpose: expo emits only the
// fields it's given — `og:title` does NOT fall back to `title`, and there's no
// default `og:type` or `og:url`. See the seo-open-graph rule.
export const generateMetadata: GenerateMetadataFunction = async (
  request,
  params
) => {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const t = serverT(request.headers.get("accept-language"));
  const baseUrl = requestOrigin();

  try {
    // Resolve as the caller, exactly like the `loader` beside us. Anonymous, the
    // API 404s an unverified piece and this fell back to the `notFound` title —
    // so its own author read "Œuvre introuvable." in the tab while the page
    // rendered in full underneath. Two server phases of one request must not
    // disagree about who is asking.
    const artwork = await fetchArtworkBySlug(slug, forwardedCookie(request));
    // Unknown slug: no artwork to describe, but the page still needs a <title>
    // (the screen renders `ArtworkNotFound`). `notFound` doubles as the title.
    // It's a soft 404 (the loader can't set a status while still rendering), so
    // `noindex` is what actually keeps it out of the results; `follow` still
    // lets crawlers take the way back to the browse. No canonical either — a
    // canonical says "index this one", contradicting the noindex.
    if (!artwork) {
      return {
        title: t("artwork.notFound"),
        robots: { index: false, follow: true },
      };
    }
    const description =
      artwork.description ||
      t("artwork.meta.descriptionFallback", { title: artwork.title });

    // Unverified: readable by its author and admins alone, so we only got here by
    // forwarding their cookie. They get the real title — that's the point of the
    // forward — but the page is not a public document: no canonical, no share
    // preview, and never indexable. A crawler carries no cookie, so it 404s above
    // and never reaches this branch; `noindex` states the policy anyway rather
    // than resting on that.
    if (!artwork.verified) {
      return {
        title: artwork.title,
        description,
        robots: { index: false, follow: true },
      };
    }

    // `article:author`. The artist id only exists once the artwork resolves, so
    // this can't join the fetch above in a `Promise.all` — it's a second, blocking
    // round-trip in front of the document's first byte, accepted for that one tag.
    // Its own catch is load-bearing: unhandled, it would reach the catch below and
    // degrade a perfectly good artwork to `noindex` over a failed artist lookup.
    const artist = artwork.artistId
      ? await getArtistsById({ path: { id: artwork.artistId } })
          .then((res) => res.data)
          .catch(() => undefined)
      : undefined;

    // One const for both the canonical and og:url — they must not drift. Built
    // from the resolved slug, never `request.url` (a shared link carries the
    // sharer's query string, which would mint a distinct og:url per share).
    const url = `${baseUrl}/artworks/${artwork.slug}`;

    return {
      title: artwork.title,
      description,
      robots: { index: true, follow: true },
      alternates: {
        canonical: url,
      },
      openGraph: {
        // "article" is what makes the article:* tags below ship at all — under
        // any other type expo drops them silently.
        type: "article",
        url,
        siteName: "ArtKeeper",
        title: artwork.title,
        description,
        // Absolute (Garage/S3) — expo passes the URL through verbatim, it does
        // not resolve relative paths. No width/height: the API doesn't expose the
        // image's dimensions, and guessing them mis-sizes the preview's box.
        images: { url: artwork.imageUrl, alt: artwork.title },
        publishedTime: artwork.createdAt,
        modifiedTime: artwork.updatedAt,
        tags: artwork.tags,
        authors: artist ? [artist.name] : undefined,
      },
      twitter: {
        // Without it X renders a small square thumbnail instead of the hero.
        card: "summary_large_image",
        title: artwork.title,
        description,
        images: { url: artwork.imageUrl, alt: artwork.title },
      },
    };
  } catch {
    // API unreachable. Belt-and-braces: in practice the `loader` below rethrows
    // the same failure and the route 500s before this metadata is ever served
    // (verified — an unreachable API yields a 500 with no HTML), and a 500 isn't
    // indexed anyway. Kept for the case where only this phase fails: a static
    // <title>, and `noindex` so an error page can never stand in for the artwork.
    return {
      title: t("artwork.title.detail"),
      robots: { index: false, follow: true },
    };
  }
};

// Web-only, runs server-side at request time (see `unstable_useServerDataLoaders`
// in app.config.ts). It fetches everything the detail page renders — the artwork
// plus its artist, nearby pieces, and other work by the same artist — so the whole
// page is server-rendered from `useLoaderData` (see the default `Screen`) and ships
// in the initial HTML, hero included. On top of that, it emits an HTTP
// `Link: rel=preload` header for the hero image (the LCP): the browser starts
// downloading it as the document response arrives — before the JS bundle loads and
// before the markup is even parsed — so it paints the moment the hero `<img>` mounts
// (see ArtworkHero.web).
//
// The fetch runs as the caller: the request's session cookie is forwarded to every
// call below, so an author's own unverified piece server-renders for them instead
// of 404ing into the not-found. Personalizing the loader is safe for hydration —
// its payload is serialized into the HTML and `useLoaderData` hands the client's
// first render the identical object, so server and client cannot disagree. It does
// mean the HTML is per-visitor: the CDN must bypass cache when the session cookie
// is present. See the web-ssr-hydration rule.
//
// Everything here is a **seed** for the screen's React Query cache, not a payload
// the screen renders directly — so each list is the endpoint's raw page, exactly
// as the client's own refetch of that key returns it (self-exclusion is the
// screen's job, applied to seed and refetch alike). Rendering the loader payload
// straight was what froze the detail: a like patched the cache nothing was
// reading, so the button only moved on a reload.
export type DataArtworkPageLoaded = {
  artwork?: Artwork;
  artist?: Artist;
  nearbyPage?: ArtworkPage;
  moreByArtistPage?: ArtworkPage;
};

export const loader: LoaderFunction<DataArtworkPageLoaded> = async (
  request,
  params
) => {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  // Per-call, never on the shared client — see `forwardedCookie`.
  const headers = forwardedCookie(request);

  // An authenticated request renders a personalized document (the caller's private
  // artwork, their signed-in chrome), so it must never be cached and handed to the
  // next visitor. Declare that at the origin rather than relying only on the CDN's
  // bypass rule: this travels with the response, so a missing/misordered Cloudflare
  // rule — or any cache added later — can't turn one user's page into everyone's.
  // Set before the artwork lookup: the chrome is personalized even on a not-found.
  // (`setResponseHeaders` accumulates, so the hero `Link` below still applies.)
  if (headers) setResponseHeaders({ "Cache-Control": "private, no-store" });

  const artwork = await fetchArtworkBySlug(slug, headers);

  // Not visible to this caller (unknown slug, or someone else's unverified
  // piece): return an empty payload and let `Screen` render the not-found state.
  // The response stays HTTP 200 (a "soft 404") — expo-server's loader API
  // exposes only `setResponseHeaders`, with no way to set a status while still
  // server-rendering the page; both `StatusError` and returning a `Response`
  // replace the render entirely (and 500 under the dev server).
  if (!artwork) {
    return { artwork: undefined };
  }

  // Discoverable-in-initial-document hero preload (see the block comment above).
  setResponseHeaders({
    Link: `<${artwork.imageUrl}>; rel=preload; as=image; fetchpriority=high`,
  });

  // The loader runs outside React, so it can't use the `useNearbyArtworks` /
  // `useArtworksByArtist` / `useArtist` hooks — those call `useQuery` and crash
  // (`useContext` of null). Reproduce their fetch imperatively via the SDK, in
  // parallel, with the **same query params** those hooks build: the seed only
  // attaches if the key matches theirs exactly.
  const [nearbyPage, moreByArtistPage, artistRes] = await Promise.all([
    getArtworks({
      query: {
        lat: artwork.latitude,
        lng: artwork.longitude,
        radius: NEARBY_RADIUS,
        limit: PAGE_SIZE,
      },
      headers,
    }),
    artwork.artistId
      ? getArtworks({
          query: { artistId: artwork.artistId, limit: PAGE_SIZE },
          headers,
        })
      : undefined,
    artwork.artistId
      ? getArtistsById({ path: { id: artwork.artistId } })
      : undefined,
  ]);

  return {
    artwork,
    artist: artistRes?.data,
    nearbyPage: nearbyPage.data,
    moreByArtistPage: moreByArtistPage?.data,
  };
};

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  // Platform-split: reads `useLoaderData` on web, a no-op on native (loaders are
  // web-only; a bare `useLoaderData` would fetch a relative `/_expo/loaders/…` URL
  // and throw). Native therefore renders the screen with no seed and fetches.
  const dataLoaded = useLoaderArtwork();

  // One path, seed or not: the screen reads the query cache either way, and an
  // empty payload (unknown slug, or a piece this caller can't see) just means it
  // fetches client-side before deciding between the artwork and the not-found.
  return (
    <Suspense fallback={<ScreenFallback />}>
      <DetailScreen slug={slug} initial={dataLoaded} />
    </Suspense>
  );
}
