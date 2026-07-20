import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";

import type { Artist } from "@/lib/api/artists";
import type { Artwork } from "@/lib/api/artworks";
import type { EditProposalValues } from "@/pages/app/artwork/form/ProposeEditForm";

export type EditProposalFormHostProps = {
  artwork: Artwork;
  artist?: Artist;
  children: ReactNode;
};

/**
 * Owns the propose-an-edit form and shares it across the edit stack. It only
 * mounts once the artwork (and its artist, for the handle prefill) has loaded, so
 * `useForm` gets the correct `defaultValues` on first render — no reset needed.
 * The `FormProvider` wraps the whole edit `<Stack>` (the form screen and the
 * location form sheet), so the sheet writes the moved pin straight into the same
 * form. Screen-facing `note` = the API's reason; `description` = the artwork note.
 */
export const EditProposalFormHost = ({
  artwork,
  artist,
  children,
}: EditProposalFormHostProps) => {
  const methods = useForm<EditProposalValues>({
    mode: "onTouched",
    defaultValues: {
      title: artwork.title,
      artistId: artwork.artistId,
      artistHandle: artist?.slug ?? "",
      tags: artwork.tags,
      description: artwork.description ?? "",
      latitude: artwork.latitude,
      longitude: artwork.longitude,
      address: "",
      note: "",
      isAccuracyConfirmed: false,
    },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
