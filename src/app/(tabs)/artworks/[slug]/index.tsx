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
import type { Artwork } from "@/lib/api/artworks";
import { getArtworksSlugBySlug } from "@/lib/api/generated/sdk.gen";
import { serverT } from "@/lib/i18n/server";
import { DetailScreen } from "@/pages/app/artwork/screens/DetailScreen";
import { ScreenFallback } from "@/shared/ui/screen-fallback/ScreenFallback";

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

  try {
    // The configured client sets `throwOnError: true`, so a resolved call always
    // has `data` — cast away the SDK's `T | undefined` success type (as elsewhere
    // in the data layer, e.g. `setLike` in `lib/api/artworks.ts`).
    const { data } = await getArtworksSlugBySlug({ path: { slug } });
    const artwork = data as Artwork;
    const description =
      artwork.description ||
      t("artwork.meta.descriptionFallback", { title: artwork.title });

    return {
      title: artwork.title,
      description,
      openGraph: {
        title: artwork.title,
        description,
        images: artwork.imageUrl,
      },
    };
  } catch {
    // Unknown slug or API unreachable: still give the page a sensible <title>
    // (the screen renders its own not-found / error branch).
    return { title: t("artwork.title.detail") };
  }
};

// Web-only, runs server-side at request time (see `unstable_useServerDataLoaders`
// in app.config.ts). The detail screen's LCP is the hero image, but nothing about
// the artwork is in the initial HTML — the app renders a blank auth-gated shell on
// the server and only fetches the artwork client-side, so the image request starts
// very late and Lighthouse flags it as "not discoverable in initial document".
// Reusing the same server-side fetch `generateMetadata` already does, we emit an
// HTTP `Link: rel=preload` header so the browser starts downloading the hero image
// as soon as the document response arrives — before the JS bundle even loads. The
// image then paints from that preloaded response the moment the client mounts the
// hero `<img>` (see ArtworkHero.web). The returned artwork is embedded in the HTML
// and available to `useLoaderData` if we later seed React Query from it.
export const loader: LoaderFunction<{ artwork: Artwork | null }> = async (
  _request,
  params,
) => {
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  try {
    // Same cast as `generateMetadata` / the data layer: the configured client
    // sets `throwOnError: true`, so a resolved call always has `data`.
    const { data } = await getArtworksSlugBySlug({ path: { slug } });
    const artwork = data as Artwork;
    setResponseHeaders({
      Link: `<${artwork.imageUrl}>; rel=preload; as=image; fetchpriority=high`,
    });
    return { artwork };
  } catch {
    // Unknown slug or API unreachable: no preload; the screen renders its own
    // not-found / error branch from its client-side query.
    return { artwork: null };
  }
};

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  // `DetailScreen` reads the loader data (`useLoaderArtwork` on web), which
  // suspends during client-side navigation (on initial load the data is already
  // in the HTML, so it doesn't). The boundary shows a themed spinner meanwhile.
  return (
    <Suspense fallback={<ScreenFallback />}>
      <DetailScreen slug={slug} />
    </Suspense>
  );
}
