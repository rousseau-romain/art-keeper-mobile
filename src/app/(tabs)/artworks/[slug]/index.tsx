import { useLocalSearchParams } from "expo-router";

import { DetailScreen } from "@/pages/app/artwork/screens/DetailScreen";

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <DetailScreen slug={slug} />;
}
