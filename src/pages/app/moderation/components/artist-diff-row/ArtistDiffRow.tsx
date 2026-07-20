import { useTranslation } from "react-i18next";

import { useArtist } from "@/lib/api/artists";
import { DiffRow } from "@/pages/app/moderation/components/diff-row/DiffRow";
import { FIELD_LABEL_KEY } from "@/pages/app/moderation/proposal-diff";

export type ArtistDiffRowProps = {
  /** The artist id for this side (before/after), or null when unattributed. */
  artistId: string | null;
  /** Which panel this row belongs to — drives the tint + marker. */
  side: "before" | "after";
  /** Whether the proposal changes the artist. */
  isChanged: boolean;
};

/**
 * The artist diff row. The proposal stores the artist as an id, but a reviewer
 * reads a name — so this resolves the side's `artistId` to the artist's display
 * name via `useArtist` and renders a plain {@link DiffRow}. Falls back to the
 * em-dash placeholder while the name loads or when no artist is attributed.
 */
export const ArtistDiffRow = ({
  artistId,
  side,
  isChanged,
}: ArtistDiffRowProps) => {
  const { t: tr } = useTranslation();
  const { data: artist } = useArtist(artistId);

  return (
    <DiffRow
      label={tr(FIELD_LABEL_KEY.artist)}
      value={artist?.name ?? tr("moderation.noValue")}
      side={side}
      isChanged={isChanged}
    />
  );
};
