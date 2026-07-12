import { useLocalSearchParams } from "expo-router";
import type { GenerateMetadataFunction } from "expo-router/server";
import { serverT } from "@/lib/i18n/server";
import { IndexScreen } from "@/pages/app/artwork/screens/IndexScreen";

// Static page title, resolved server-side in the request's locale (server
// rendering) so the browse page ships its <title> in the earliest HTML bytes.
export const generateMetadata: GenerateMetadataFunction = async (request) => {
  const t = serverT(request.headers.get("accept-language"));
  return { title: t("artwork.title.index") };
};

export default function Screen() {
  const { q, scope, tag } = useLocalSearchParams<{
    q?: string;
    scope?: string;
    tag?: string | string[];
  }>();
  return (
    <IndexScreen initialQuery={q} initialScope={scope} initialTags={tag} />
  );
}
