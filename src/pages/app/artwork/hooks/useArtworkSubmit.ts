import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { type Artwork, useCreateArtwork } from "@/lib/api/artworks";
import { ApiError } from "@/lib/api/client";
import { clearArtworkDraft } from "@/pages/app/artwork/draft-store";
import type { ArtworkValues } from "@/pages/app/artwork/form/ArtworkForm";
import { useToast } from "@/shared/ui/toast/Toast";

type UseArtworkSubmitParams = {
  methods: UseFormReturn<ArtworkValues>;
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
 * create mutation, surfaces failures as a toast, and exposes the `created`
 * artwork that flips the screen to the success panel.
 */
export const useArtworkSubmit = ({ methods }: UseArtworkSubmitParams) => {
  const { t: tr } = useTranslation();
  const { show } = useToast();
  const { mutateAsync, isPending } = useCreateArtwork();
  const [created, setCreated] = useState<Artwork | null>(null);

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
    if (!values.rightsConfirmed) {
      show(tr("artwork.new.errors.rightsRequired"), "warning");
      return;
    }

    try {
      const artwork = await mutateAsync({
        title: values.title.trim(),
        latitude: values.latitude,
        longitude: values.longitude,
        description: values.note.trim() || undefined,
        tags: values.tags,
        artistId: values.artistId ?? undefined,
        image: fileFromUri(cover.uri),
      });
      await clearArtworkDraft();
      setCreated(artwork);
    } catch (e) {
      show(
        e instanceof ApiError ? e.message : tr("auth.genericError"),
        "error",
      );
    }
  });

  return {
    onSubmit,
    submitting: isPending,
    created,
    clearCreated: () => setCreated(null),
  };
};
