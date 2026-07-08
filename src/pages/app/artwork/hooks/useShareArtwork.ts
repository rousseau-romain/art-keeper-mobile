import * as Linking from "expo-linking";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Share } from "react-native";
import type { Artwork } from "@/lib/api/artworks";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { useToast } from "@/shared/ui/toast/Toast";

/**
 * Share the current artwork. On web it uses the Web Share API when available and
 * otherwise copies the page URL to the clipboard; on native it opens the OS share
 * sheet (RN `Share`) with the title and an app-scheme deep link. A dismissed web
 * share sheet (AbortError) is a no-op; any real failure surfaces as a toast.
 */
export const useShareArtwork = (artwork: Artwork) => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const haptic = useHaptics();

  const onShare = useCallback(async () => {
    const url =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.href
        : Linking.createURL(`/artworks/${artwork.slug}`);
    try {
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: artwork.title, url });
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          show(tr("artwork.detail.linkCopied"), "success");
        }
      } else {
        await Share.share({ message: artwork.title, url });
      }
      haptic("light");
    } catch (e) {
      // The Web Share API rejects with AbortError when the user dismisses the
      // native sheet — that's not an error, so swallow it.
      if (e instanceof Error && e.name === "AbortError") return;
      show(tr("artwork.detail.shareFailed"), "error");
    }
  }, [artwork.title, artwork.slug, show, tr, haptic]);

  return { onShare };
};
