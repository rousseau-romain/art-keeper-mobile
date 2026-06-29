import { useLocalSearchParams } from "expo-router";

import { SuccessScreen } from "@/pages/app/artwork/screens/SuccessScreen";

export default function Screen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <SuccessScreen slug={slug} />;
}
