import type {
  ArtworkChangeProposal,
  ProposalFields,
} from "@/lib/api/moderation";

/**
 * The logical fields a reviewer compares, in display order. `photo` is rendered
 * as the panel's image box; the rest are text rows. The union doubles as the
 * `moderation.field.*` i18n key set.
 */
export type ProposalFieldKey =
  | "photo"
  | "artist"
  | "title"
  | "tags"
  | "description"
  | "location";

/** One field's before/after values plus whether the proposal changes it. */
export type DiffField = {
  key: ProposalFieldKey;
  before: string | null;
  after: string | null;
  isChanged: boolean;
};

// Field key → its `moderation.field.*` i18n key, so `t()` stays type-checked.
// Shared by the diff panel (row labels) and the queue descriptor.
export const FIELD_LABEL_KEY: Record<
  ProposalFieldKey,
  | "moderation.field.photo"
  | "moderation.field.artist"
  | "moderation.field.title"
  | "moderation.field.tags"
  | "moderation.field.description"
  | "moderation.field.location"
> = {
  photo: "moderation.field.photo",
  artist: "moderation.field.artist",
  title: "moderation.field.title",
  tags: "moderation.field.tags",
  description: "moderation.field.description",
  location: "moderation.field.location",
};

/** Order the rows/descriptor follow (photo drives the image box, not a row). */
const FIELD_ORDER: ProposalFieldKey[] = [
  "photo",
  "artist",
  "title",
  "tags",
  "description",
  "location",
];

// Logical field → the raw `changes`/`previous` keys it reads. A field is "touched"
// by the proposal when at least one of its raw keys is present in `changes`
// (the API sends `changes` as a partial — only the edited keys).
const FIELD_RAW_KEYS: Record<ProposalFieldKey, (keyof ProposalFields)[]> = {
  photo: ["imageUrl"],
  artist: ["artistId"],
  title: ["title"],
  tags: ["tags"],
  description: ["description"],
  location: ["latitude", "longitude"],
};

/** Whether the proposal's `changes` actually touches this logical field. */
const isTouched = (changes: ProposalFields, key: ProposalFieldKey): boolean =>
  FIELD_RAW_KEYS[key].some((raw) => changes[raw] !== undefined);

/** Format one logical field of a side (`previous` or `changes`) to display text. */
const format = (key: ProposalFieldKey, side: ProposalFields): string | null => {
  switch (key) {
    case "photo":
      return side.imageUrl ?? null;
    case "artist":
      return side.artistId ?? null;
    case "title":
      return side.title ?? null;
    case "tags":
      return side.tags?.length
        ? side.tags.map((tag) => `#${tag}`).join(" · ")
        : null;
    case "description":
      return side.description ?? null;
    case "location":
      return side.latitude != null && side.longitude != null
        ? `${side.latitude.toFixed(5)}, ${side.longitude.toFixed(5)}`
        : null;
    default:
      return null;
  }
};

/**
 * Inverse of `format`'s `location` case: parse a `"lat, lng"` display string back
 * to numeric coordinates (or `null` when it isn't a coordinate — e.g. the
 * `noValue` placeholder). Lets the location diff row open a map from the value it
 * already renders, without threading the raw coords through the diff model.
 */
export const parseCoords = (
  value: string | null,
): { latitude: number; longitude: number } | null => {
  if (!value) return null;
  const [latitude, longitude] = value.split(", ").map(Number);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? { latitude, longitude }
    : null;
};

/**
 * Build the per-field before/after diff for a proposal. Every field the artwork
 * has is included so both panels show the full record; a field the proposal
 * doesn't touch mirrors its `previous` value into the "after" side (so it reads
 * identically on both sides and stays neutral). `isChanged` — the red/green tint —
 * is true only when the proposal edits the field and the value actually differs.
 * Works whether the API sends `changes` as a full snapshot or only the edited keys.
 */
export const buildProposalDiff = (
  proposal: ArtworkChangeProposal,
): DiffField[] =>
  FIELD_ORDER.map((key) => {
    const before = format(key, proposal.previous);
    const after = isTouched(proposal.changes, key)
      ? format(key, proposal.changes)
      : before;
    return { key, before, after, isChanged: before !== after };
  }).filter((field) => field.before !== null || field.after !== null);
