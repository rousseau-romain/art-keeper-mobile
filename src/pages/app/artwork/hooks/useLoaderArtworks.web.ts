import { useLoaderData } from "expo-router";
import type { LoaderFunction } from "expo-router/server";
import type { ArtworkPage } from "@/lib/api/artworks";

type ArtworksLoader = LoaderFunction<{ page: ArtworkPage | null }>;

/**
 * Reads the first artwork page the route's server `loader` embedded in the HTML,
 * to seed React Query so the browse list renders from SSR data (no client fetch
 * first). The loader prefetches the page matching the URL's query params, so the
 * seeded list is already filtered.
 *
 * On the initial page load the data is already in the document, so this resolves
 * synchronously (no suspense); on client-side navigation `useLoaderData` suspends
 * until the loader data arrives, so the caller must render under a <Suspense>
 * boundary (see the browse route's Screen).
 */
export const useLoaderArtworks = (): ArtworkPage | undefined => {
  const data = useLoaderData<ArtworksLoader>();
  return data?.page ?? undefined;
};
