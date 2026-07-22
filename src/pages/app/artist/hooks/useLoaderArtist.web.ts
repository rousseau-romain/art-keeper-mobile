import { useLoaderData } from "expo-router";
import type { LoaderFunction } from "expo-router/server";
import type { DataArtistPageLoaded } from "@/app/(tabs)/artists/[slug]";

type ArtistLoader = LoaderFunction<DataArtistPageLoaded>;

/**
 * Reads what the profile route's server `loader` embedded in the HTML — the artist
 * plus their pieces — so the page renders from SSR data. On the initial page load
 * the data is already in the document (resolves synchronously); on client-side
 * navigation `useLoaderData` suspends until the loader data arrives. Mirrors
 * `useLoaderArtwork.web`.
 */
export const useLoaderArtist = (): DataArtistPageLoaded | undefined =>
  useLoaderData<ArtistLoader>();
