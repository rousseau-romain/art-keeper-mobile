/** Where the TagPicker's quick-pick chips come from (a persisted user setting):
 * `mostUsed` → account tags by count desc, `lastUsed` → most recently created,
 * `none` → no suggestion chips. The `GET /tags/` `sort` param is derived from
 * this in `useTagSource`. */
export const TagSourceEnum = {
  mostUsed: "mostUsed",
  lastUsed: "lastUsed",
  none: "none",
} as const;

export type TagSourceEnumType = keyof typeof TagSourceEnum;
