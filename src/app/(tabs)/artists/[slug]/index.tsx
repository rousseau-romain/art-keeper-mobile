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
import { type ArtworkPage, PAGE_SIZE } from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import {
  getArtistsSlugBySlug,
  getArtworks,
} from "@/lib/api/generated/sdk.gen";
import { forwardedCookie } from "@/lib/api/ssr-auth";
import { serverT } from "@/lib/i18n/server";
import { requestOrigin } from "@/lib/seo/request-origin";
import { useLoaderArtist } from "@/pages/app/artist/hooks/useLoaderArtist";
import { DetailScreen } from "@/pages/app/artist/screens/DetailScreen";
import { ScreenFallback } from "@/shared/ui/screen-fallback/ScreenFallback";

// Fetch an artist by slug, mapping "no such slug" to `undefined` instead of a
// throw (the configured client sets `throwOnError: true`, so a 404 arrives as a
// rejected `ApiError`; left unhandled it would 500 the whole loader). Any other
// error (API down, 5xx) still throws. `headers` carries the caller's forwarded
// cookie — the profile is public, so it mainly matters for a future
// visibility-per-caller rule; mirrors `fetchArtworkBySlug`.
const fetchArtistBySlug = async (
  slug: string,
  headers?: { cookie: string },
): Promise<Artist | undefined> => {
  try {
    const { data } = await getArtistsSlugBySlug({ path: { slug }, headers });
    return data;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return undefined;
    throw e;
  }
};

// Resolve the profile's SEO / Open Graph tags from the live artist at request
// time (server rendering), so social + search crawlers — which don't run the
// client JS — see the real name, description, and avatar. Web-only, server-only.
export const generateMetadata: GenerateMetadataFunction = async (
  request,
  params,
) => {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const t = serverT(request.headers.get("accept-language"));
  const baseUrl = requestOrigin();

  try {
    const artist = await fetchArtistBySlug(slug, forwardedCookie(request));
    // Unknown slug: no artist to describe, but the page still needs a <title>
    // (the screen renders `ArtistNotFound`). Soft 404 → `noindex`, `follow` still
    // lets crawlers walk back to browse. No canonical (it contradicts noindex).
    if (!artist) {
      return {
        title: t("artist.notFound"),
        robots: { index: false, follow: true },
      };
    }

    const description =
      artist.description ||
      t("artist.meta.descriptionFallback", { name: artist.name });

    // Unverified: not a public document — no canonical, no share preview, never
    // indexable. States the policy explicitly (a crawler carries no cookie, but
    // the tag doesn't rest on that).
    if (!artist.verified) {
      return {
        title: artist.name,
        description,
        robots: { index: false, follow: true },
      };
    }

    // One const for both the canonical and og:url — they must not drift. Built
    // from the resolved slug, never `request.url`.
    const url = `${baseUrl}/artists/${artist.slug}`;

    return {
      title: artist.name,
      description,
      robots: { index: true, follow: true },
      alternates: { canonical: url },
      openGraph: {
        type: "profile",
        url,
        siteName: "ArtKeeper",
        title: artist.name,
        description,
        // Absolute (Garage/S3); expo passes the URL through verbatim. Omitted when
        // the artist has no avatar rather than shipping an empty tag.
        images: artist.avatarUrl
          ? { url: artist.avatarUrl, alt: artist.name }
          : undefined,
      },
      twitter: {
        card: "summary",
        title: artist.name,
        description,
        images: artist.avatarUrl
          ? { url: artist.avatarUrl, alt: artist.name }
          : undefined,
      },
    };
  } catch {
    // API unreachable — belt-and-braces (the loader below rethrows and 500s
    // before this is served). Static title + noindex so an error page never
    // stands in for the profile.
    return {
      title: t("artist.title.detail"),
      robots: { index: false, follow: true },
    };
  }
};

// Web-only, runs server-side at request time. Fetches the artist plus their
// pieces, so the whole profile is server-rendered from `useLoaderData` (see the
// default `Screen`) and ships in the initial HTML. The fetch runs as the caller
// (forwarded cookie); the payload is a **seed** for the screen's React Query
// cache. Mirrors the artwork detail loader.
export type DataArtistPageLoaded = {
  artist?: Artist;
  artworksPage?: ArtworkPage;
};

export const loader: LoaderFunction<DataArtistPageLoaded> = async (
  request,
  params,
) => {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const headers = forwardedCookie(request);

  // An authenticated request renders a personalized document (its signed-in
  // chrome, the follow state), so it must never be cached and handed to the next
  // visitor. Declared at the origin, before the lookup. (`setResponseHeaders`
  // accumulates, so the avatar `Link` below still applies.)
  if (headers) setResponseHeaders({ "Cache-Control": "private, no-store" });

  const artist = await fetchArtistBySlug(slug, headers);

  // Not found: empty payload, `Screen` renders the not-found. HTTP stays 200
  // (soft 404) — the loader API can't set a status while server-rendering.
  if (!artist) {
    return { artist: undefined };
  }

  // Discoverable-in-initial-document avatar preload (the profile's LCP).
  if (artist.avatarUrl) {
    setResponseHeaders({
      Link: `<${artist.avatarUrl}>; rel=preload; as=image; fetchpriority=high`,
    });
  }

  // Reproduce `useArtworksByArtist`'s fetch imperatively (the loader runs outside
  // React) with the **same query params**, so the seed attaches to that key.
  const artworksRes = await getArtworks({
    query: { artistId: artist.id, limit: PAGE_SIZE },
    headers,
  });

  return { artist, artworksPage: artworksRes.data };
};

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  // Platform-split: reads `useLoaderData` on web, a no-op on native (loaders are
  // web-only; a bare `useLoaderData` would fetch a relative `/_expo/loaders/…`
  // URL and throw). Native renders the screen with no seed and fetches.
  const dataLoaded = useLoaderArtist();

  return (
    <Suspense fallback={<ScreenFallback />}>
      <DetailScreen slug={slug} initial={dataLoaded} />
    </Suspense>
  );
}
