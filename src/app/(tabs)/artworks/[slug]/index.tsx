import { useLocalSearchParams } from "expo-router";
import type { GenerateMetadataFunction } from "expo-router/server";

// Side-effect: configure the generated API client (base URL + interceptors)
// before the server-side fetch in `generateMetadata` runs. Metadata resolves
// outside the React tree, so `_layout`'s import of this module may not have run.
import "@/lib/api/client";
import type { Artwork } from "@/lib/api/artworks";
import { getArtworksSlugBySlug } from "@/lib/api/generated/sdk.gen";
import { serverT } from "@/lib/i18n/server";
import { DetailScreen } from "@/pages/app/artwork/screens/DetailScreen";

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

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <DetailScreen slug={slug} />;
}
