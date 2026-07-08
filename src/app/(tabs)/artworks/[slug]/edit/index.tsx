import { useLocalSearchParams } from "expo-router";

import { EditScreen } from "@/pages/app/artwork/screens/EditScreen";

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <EditScreen slug={slug} />;
}
