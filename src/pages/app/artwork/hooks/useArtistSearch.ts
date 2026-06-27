import { useMemo, useState } from "react";

import {
  type ArtistListItem,
  useArtists,
  useCreateArtist,
} from "@/lib/api/artists";

/**
 * Powers the artist autocomplete. The list endpoint searches by name server-side
 * (`name` param) and orders verified artists first (`sort`), so we just forward
 * the user's query and skip the fetch while it's empty. Verified artists are
 * kept client-side to match the dropdown's "verified only" rule. When nothing
 * matches, `createArtist` quick-creates one from the typed name.
 */
export const useArtistSearch = () => {
  const [query, setQuery] = useState("");

  const normalized = query.trim().replace(/^@/, "").toLowerCase();

  const { artists, isLoading } = useArtists(
    { name: normalized ? [normalized] : undefined, sort: "-verified,name" },
    { enabled: normalized.length > 0 },
  );

  const matches = useMemo<ArtistListItem[]>(() => {
    if (!normalized) return [];
    return artists.slice(0, 6);
  }, [artists, normalized]);

  const { mutateAsync: createArtist, isPending: creating } = useCreateArtist();

  return { query, setQuery, matches, isLoading, createArtist, creating };
};
