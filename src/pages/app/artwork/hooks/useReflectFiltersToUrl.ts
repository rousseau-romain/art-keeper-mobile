import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import {
  isSearchScope,
  type SearchScope,
  toTagArray,
} from "@/lib/api/artworks";
import {
  getSearch,
  getSearchScope,
  getSelectedTags,
  setFilters,
} from "@/pages/app/artwork/filter-store";

export type UseReflectFiltersToUrlArgs = {
  selectedTags: string[];
  search: string;
  searchScope: SearchScope;
};

/**
 * Two-way live sync between the filter sheet's URL query string and the filter
 * store — web only (native has no address bar). It keeps `/artworks/filters?…`
 * shareable *as you edit*: `router.setParams` uses History `replaceState`, so
 * the URL updates with **no reload and no remount** (the tag input keeps focus).
 *
 * The sheet is a separate route from the browse, so this is the sheet's own
 * counterpart to the browse's `useArtworkFiltersUrlSync`; closing the sheet hands
 * the same store off to that hook, which reflects it onto `/artworks`.
 *
 * On mount it disambiguates intent, exactly the ambiguity the browse hook faces:
 * - **URL has filters** → a shared / deep link is the intent → seed the store.
 * - **URL empty but the store isn't** → opened from an already-filtered browse →
 *   reflect the store into the URL.
 *
 * After mount it reflects store → URL on every change. The reflect effect skips
 * the **mount pass** on purpose: a cold link seeds the store asynchronously, so
 * reflecting on that first pass would write the still-empty store and wipe the
 * incoming params before the seed lands.
 */
export const useReflectFiltersToUrl = ({
  selectedTags,
  search,
  searchScope,
}: UseReflectFiltersToUrlArgs): void => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    q?: string;
    scope?: string;
    tag?: string | string[];
  }>();
  const mounted = useRef(false);
  const skipReflect = useRef(true);

  const writeUrl = (tags: string[], q: string, scope: SearchScope): void => {
    // The filters route is typed param-less; narrow setParams to our query shape.
    const setParams = router.setParams as unknown as (p: {
      q?: string;
      scope?: SearchScope;
      tag?: string[];
    }) => void;
    setParams({
      q: q || undefined,
      scope: scope === "all" ? undefined : scope,
      tag: tags.length ? tags : undefined,
    });
  };

  // Mount: seed from the URL (shared link) or reflect the store (opened filtered).
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (Platform.OS !== "web" || mounted.current) return;
    mounted.current = true;

    const urlTags = toTagArray(params.tag);
    const urlScope = isSearchScope(params.scope) ? params.scope : "all";
    const urlQ = typeof params.q === "string" ? params.q : "";
    const urlHasFilters =
      urlTags.length > 0 || urlQ !== "" || urlScope !== "all";

    if (urlHasFilters) {
      setFilters({ tags: urlTags, search: urlQ, scope: urlScope });
    } else if (
      getSelectedTags().length > 0 ||
      getSearch() !== "" ||
      getSearchScope() !== "all"
    ) {
      writeUrl(getSelectedTags(), getSearch(), getSearchScope());
    }
  }, [params, router]);

  // After mount: reflect store → URL on every filter change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: writeUrl is stable per render; the store values are the real triggers.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (skipReflect.current) {
      skipReflect.current = false;
      return;
    }
    writeUrl(selectedTags, search, searchScope);
  }, [selectedTags, search, searchScope]);
};
