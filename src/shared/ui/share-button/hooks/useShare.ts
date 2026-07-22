import * as Linking from "expo-linking";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Share } from "react-native";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { useToast } from "@/shared/ui/toast/Toast";

export type UseShareParams = {
  /** The entity's display name/title — the share message and web-share title. */
  title: string;
  /** The entity's in-app path (e.g. `/artists/<slug>`) — the native deep-link target. */
  path: string;
};

/**
 * Share an entity by title + in-app path. On web it uses the Web Share API when
 * available and otherwise copies the current page URL to the clipboard; on native
 * it opens the OS share sheet (RN `Share`) with the title and an app-scheme deep
 * link to `path`. A dismissed web share sheet (AbortError) is a no-op; any real
 * failure surfaces as a toast. Shared by the artwork and artist share buttons.
 */
export const useShare = ({ title, path }: UseShareParams) => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const haptic = useHaptics();

  const onShare = useCallback(async () => {
    const url =
      Platform.OS === "web" && typeof window !== "undefined"
        ? window.location.href
        : Linking.createURL(path);
    try {
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title, url });
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          show(tr("common.linkCopied"), "success");
        }
      } else {
        await Share.share({ message: title, url });
      }
      haptic("light");
    } catch (e) {
      // The Web Share API rejects with AbortError when the user dismisses the
      // native sheet — that's not an error, so swallow it.
      if (e instanceof Error && e.name === "AbortError") return;
      show(tr("common.shareFailed"), "error");
    }
  }, [title, path, show, tr, haptic]);

  return { onShare };
};
