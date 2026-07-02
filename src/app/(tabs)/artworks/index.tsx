import { useLocalSearchParams } from "expo-router";
import { IndexScreen } from "@/pages/app/artwork/screens/IndexScreen";

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
