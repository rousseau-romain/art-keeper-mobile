import { useLoaderData } from "expo-router";
import type { LoaderFunction } from "expo-router/server";
import type { DataArtworkPageLoaded } from "@/app/(tabs)/artworks/[slug]";

type ArtworkLoader = LoaderFunction<DataArtworkPageLoaded>;

/**
 * Reads what the detail route's server `loader` embedded in the HTML — the artwork
 * plus its artist, nearby pieces, and more by the same artist — so the page renders
 * from SSR data, hero included.
 *
 * On the initial page load the data is already in the document, so this resolves
 * synchronously (no suspense); on client-side navigation `useLoaderData` suspends
 * until the loader data arrives.
 */
export const useLoaderArtwork = (): DataArtworkPageLoaded | undefined => {
  return useLoaderData<ArtworkLoader>();
};
