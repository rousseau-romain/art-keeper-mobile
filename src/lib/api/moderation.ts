import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getArtworksByIdQueryKey,
  getArtworksChangesOptions,
  getArtworksChangesQueryKey,
  getArtworksInfiniteQueryKey,
} from "./generated/@tanstack/react-query.gen";
import { patchArtworksByIdChangesByChangeId } from "./generated/sdk.gen";
import type { ArtworkChangeProposal } from "./generated/types.gen";

export type { ArtworkChangeProposal };

/**
 * The proposal's before/after payload — `previous` (current) and `changes`
 * (proposed) share this shape, so a field-by-field diff reads one against the
 * other. Derived from the generated model so it stays in sync with the spec.
 */
export type ProposalFields = ArtworkChangeProposal["changes"];

/** The review decision that closes a proposal. */
export type ReviewDecision = "approved" | "rejected";

// --- Hooks ----------------------------------------------------------------

/**
 * The moderation queue: every pending artwork change proposal. Each item embeds
 * both `previous` and `changes`, so the review screen renders the before/after
 * diff without a separate artwork fetch. Returns the flattened rows plus the raw
 * query so the screen can render loading / error / empty / refetch states.
 */
export const usePendingChanges = () => {
  const query = useQuery({
    ...getArtworksChangesOptions({ query: { status: "pending" } }),
  });

  const proposals = query.data?.data ?? [];
  return { ...query, proposals };
};

/**
 * Approve or reject a change proposal (reviewer/admin only). On settle we
 * invalidate the changes queue (the decided item leaves `pending`) and, on an
 * approval, the affected artwork's detail + every list it sits in — the accepted
 * edit changes what those render.
 */
export const useReviewChange = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      artworkId,
      changeId,
      decision,
    }: {
      artworkId: string;
      changeId: string;
      decision: ReviewDecision;
    }): Promise<ArtworkChangeProposal> =>
      patchArtworksByIdChangesByChangeId({
        path: { id: artworkId, changeId },
        body: { status: decision },
      }).then(({ data }) => data as ArtworkChangeProposal),

    onSettled: (_data, _err, { artworkId, decision }) => {
      qc.invalidateQueries({ queryKey: getArtworksChangesQueryKey() });
      if (decision === "approved") {
        qc.invalidateQueries({
          queryKey: getArtworksByIdQueryKey({ path: { id: artworkId } }),
        });
        // Detail/edit screens read the artwork by slug (`useArtworkBySlug`), and
        // an approved title change can even alter the slug itself — so the id
        // key above never matches those entries. Drop every slug-detail query so
        // the accepted edit is refetched.
        qc.invalidateQueries({
          predicate: (q) =>
            (q.queryKey[0] as { _id?: string })?._id ===
            "getArtworksSlugBySlug",
        });
        qc.invalidateQueries({ queryKey: getArtworksInfiniteQueryKey() });
      }
    },
  });
};
