import { useTranslation } from "react-i18next";

/**
 * Shared label logic for the artwork filter UI, so the `FilterPill` button and
 * the filter sheet header don't each re-derive the `appliedCount` copy.
 *
 * - `applied` — the "{count} filters" string when any filter is active, else
 *   `undefined` (for callers that hide the label at zero, like the sheet header).
 * - `label` — `applied` with the generic "Filters" fallback at zero (for the
 *   pill button, which always shows text).
 */
export const useFilterLabel = (count: number) => {
  const { t: tr } = useTranslation();
  const applied =
    count > 0 ? tr("artwork.filters.appliedCount", { count }) : undefined;
  return { applied, label: applied ?? tr("artwork.filters.open") };
};
