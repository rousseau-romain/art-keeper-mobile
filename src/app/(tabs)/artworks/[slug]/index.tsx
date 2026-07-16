import { useLoaderData } from "expo-router";
import type {
  GenerateMetadataFunction,
  LoaderFunction,
} from "expo-router/server";
import { origin, setResponseHeaders } from "expo-server";
import { Suspense } from "react";

// Side-effect: configure the generated API client (base URL + interceptors)
// before the server-side fetch in `generateMetadata` runs. Metadata resolves
// outside the React tree, so `_layout`'s import of this module may not have run.
import "@/lib/api/client";
import type { Artist } from "@/lib/api/artists";
import {
  type Artwork,
  excludeArtwork,
  NEARBY_RADIUS,
  PAGE_SIZE,
} from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import {
  getArtistsById,
  getArtworks,
  getArtworksSlugBySlug,
} from "@/lib/api/generated/sdk.gen";
import { serverT } from "@/lib/i18n/server";
import { ArtworkNotFound } from "@/pages/app/artwork/components/artwork-not-found/ArtworkNotFound";
import { DetailScreen } from "@/pages/app/artwork/screens/DetailScreen";
import { ScreenFallback } from "@/shared/ui/screen-fallback/ScreenFallback";

// Fetch an artwork by slug, mapping "no such slug" to `undefined` instead of a
// throw. The configured client sets `throwOnError: true`, so the backend's 404
// arrives as a rejected `ApiError` — left unhandled it fails the whole loader
// (a 500 on every unknown slug). Any other error (API down, 5xx) still throws,
// so a real outage isn't silently reported to users as "not found".
const fetchArtworkBySlug = async (
  slug: string,
): Promise<Artwork | undefined> => {
  try {
    const { data } = await getArtworksSlugBySlug({ path: { slug } });
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
export const generateMetadata: GenerateMetadataFunction = async (
  request,
  params,
) => {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const t = serverT(request.headers.get("accept-language"));
  const baseUrl = origin();

  try {
    const artwork = await fetchArtworkBySlug(slug);
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

    return {
      title: artwork.title,
      description,
      robots: { index: true, follow: true },
      alternates: {
        canonical: `${baseUrl}/artworks/${artwork.slug}`,
      },
      openGraph: {
        title: artwork.title,
        description,
        images: artwork.imageUrl,
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
export type DataArtworkPageLoaded = {
  artwork?: Artwork;
  artist?: Artist;
  nearbyArtwortk?: { radius: number; artwork: Artwork[] };
  moreArtworkByArtist?: Artwork[];
};

export const loader: LoaderFunction<DataArtworkPageLoaded> = async (
  _request,
  params,
) => {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const artwork = await fetchArtworkBySlug(slug);

  // No such slug: return an empty payload and let `Screen` render the not-found
  // state. The response stays HTTP 200 (a "soft 404") — expo-server's loader API
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
  // parallel. The configured client throws on non-2xx, so `data` is defined.
  const [nearbyPage, moreByArtistPage, artistRes] = await Promise.all([
    getArtworks({
      query: {
        lat: artwork.latitude,
        lng: artwork.longitude,
        radius: NEARBY_RADIUS,
        limit: PAGE_SIZE,
      },
    }),
    artwork.artistId
      ? getArtworks({ query: { artistId: artwork.artistId, limit: PAGE_SIZE } })
      : undefined,
    artwork.artistId
      ? getArtistsById({ path: { id: artwork.artistId } })
      : undefined,
  ]);

  // Drop the artwork itself from its own neighbourhood / the "more by" strip.
  const nearby = excludeArtwork(nearbyPage.data?.data ?? [], artwork.id);
  const moreArtworkByArtist = excludeArtwork(
    moreByArtistPage?.data?.data ?? [],
    artwork.id,
  );

  return {
    artwork,
    artist: artistRes?.data,
    nearbyArtwortk: { artwork: nearby, radius: NEARBY_RADIUS },
    moreArtworkByArtist,
  };
};

export default function Screen() {
  const dataLoaded = useLoaderData<typeof loader>();

  if (!dataLoaded.artwork) {
    return <ArtworkNotFound />;
  }

  return (
    <Suspense fallback={<ScreenFallback />}>
      <DetailScreen {...dataLoaded} artwork={dataLoaded.artwork} />
    </Suspense>
  );
}
