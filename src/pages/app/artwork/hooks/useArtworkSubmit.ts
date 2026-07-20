import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { type Artwork, useCreateArtwork } from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import { clearArtworkDraft } from "@/pages/app/artwork/draft-store";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useHaptics } from "@/shared/hooks/useHaptics";
import { useToast } from "@/shared/ui/toast/Toast";

type UseArtworkSubmitParams = {
  methods: UseFormReturn<ArtworkValues>;
  onCreated: (artwork: Artwork) => void;
};

/** Guess a multipart filename + mime from the picked photo's uri. */
const fileFromUri = (uri: string) => {
  const name = uri.split("/").pop() || "artwork.jpg";
  const ext = name.split(".").pop()?.toLowerCase();
  const type =
    ext === "png" ? "image/png" : ext === "heic" ? "image/heic" : "image/jpeg";
  return { uri, name, type };
};

/**
 * Owns the wizard submit: validates the collected values, runs the multipart
 * create mutation, surfaces failures as a toast, and hands the created artwork
 * to `onCreated` (which routes to the success step).
 */
export const useArtworkSubmit = ({
  methods,
  onCreated,
}: UseArtworkSubmitParams) => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const haptic = useHaptics();
  const { mutateAsync, isPending } = useCreateArtwork();

  const onSubmit = methods.handleSubmit(async (values) => {
    const cover = values.photo;
    if (!cover) {
      show(tr("artwork.new.errors.photoRequired"), "warning");
      return;
    }
    if (values.latitude == null || values.longitude == null) {
      show(tr("artwork.new.errors.locationRequired"), "warning");
      return;
    }
    if (!values.isRightsConfirmed) {
      show(tr("artwork.new.errors.rightsRequired"), "warning");
      return;
    }

    try {
      const artwork = await mutateAsync({
        title: values.title.trim(),
        latitude: values.latitude,
        longitude: values.longitude,
        description: values.description.trim() || undefined,
        tags: values.tags,
        artistId: values.artistId ?? undefined,
        image: fileFromUri(cover.uri),
      });
      await clearArtworkDraft();
      haptic("success");
      onCreated(artwork);
    } catch (e) {
      show(
        e instanceof ApiError ? e.message : tr("auth.genericError"),
        "error",
      );
    }
  });

  return { onSubmit, submitting: isPending };
};
