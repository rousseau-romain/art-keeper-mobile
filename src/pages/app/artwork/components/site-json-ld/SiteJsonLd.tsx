export type SiteJsonLdProps = Record<string, never>;

/** No structured data on native — there's no crawlable document to describe.
 *  Web-only; the real implementation lives in `SiteJsonLd.web.tsx`. */
export const SiteJsonLd = (_props: SiteJsonLdProps) => null;
