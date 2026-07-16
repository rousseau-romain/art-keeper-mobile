import type { Artwork } from "@/lib/api/artworks";

/**
 * Native no-op. Expo Router loaders are web-only, so there's no server-embedded
 * artwork to seed React Query with — the detail screen fetches client-side as
 * usual. The web variant (`useLoaderArtwork.web.ts`) reads the loader data.
 */
export const useLoaderArtwork = (): Artwork | undefined => undefined;
