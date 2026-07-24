import type { GenerateMetadataFunction } from "expo-router/server";
import { origin } from "expo-server";

import { serverT } from "@/lib/i18n/server";
import { IndexScreen } from "@/pages/app/artist/screens/IndexScreen";

// Public content list — indexable, self-canonical. Copy is translated server-side
// from the request's Accept-Language, like the browse listing.
export const generateMetadata: GenerateMetadataFunction = async (request) => {
  const t = serverT(request.headers.get("accept-language"));
  const baseUrl = origin();

  return {
    title: t("artist.title.index"),
    robots: { index: true, follow: true },
    alternates: { canonical: `${baseUrl}/artists` },
  };
};

export default function Screen() {
  return <IndexScreen />;
}
