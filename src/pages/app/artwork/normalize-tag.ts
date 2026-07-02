/** Normalize a typed tag: trim, lowercase, drop a leading "#". */
export const normalizeTag = (raw: string) =>
  raw.trim().toLowerCase().replace(/^#+/, "");
