import type { ArtworkPage } from "@/lib/api/artworks";

/**
 * Native no-op. Expo Router loaders are web-only, so there's no server-embedded
 * page to seed React Query with — the browse screen fetches client-side as usual.
 * The web variant (`useLoaderArtworks.web.ts`) reads the loader data.
 */
export const useLoaderArtworks = (): ArtworkPage | undefined => undefined;
