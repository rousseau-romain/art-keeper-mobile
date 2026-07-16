import { useLoaderData } from "expo-router";
import type { LoaderFunction } from "expo-router/server";
import type { Artwork } from "@/lib/api/artworks";

type ArtworkLoader = LoaderFunction<{ artwork: Artwork | null }>;

/**
 * Reads the artwork the route's server `loader` embedded in the HTML, to seed
 * React Query so the detail hero renders from SSR data (no client fetch first).
 *
 * On the initial page load the data is already in the document, so this resolves
 * synchronously (no suspense); on client-side navigation `useLoaderData` suspends
 * until the loader data arrives, so the caller must render under a <Suspense>
 * boundary (see the detail route's Screen).
 */
export const useLoaderArtwork = (): Artwork | undefined => {
  const data = useLoaderData<ArtworkLoader>();
  return data?.artwork ?? undefined;
};
