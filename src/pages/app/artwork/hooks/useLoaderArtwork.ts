import type { DataArtworkPageLoaded } from "@/app/(tabs)/artworks/[slug]";

/**
 * Native no-op. Expo Router loaders are web-only: on native `useLoaderData` finds
 * neither the server context nor the injected payload, so it falls through to
 * fetching a **relative** `/_expo/loaders/…` URL, which can't resolve off the web
 * and throws inside the render. Returning `undefined` leaves `DetailScreen` with
 * no seed, so it fetches client-side — which is what native wants anyway. The web
 * variant (`useLoaderArtwork.web.ts`) reads the loader data.
 */
export const useLoaderArtwork = (): DataArtworkPageLoaded | undefined =>
  undefined;
