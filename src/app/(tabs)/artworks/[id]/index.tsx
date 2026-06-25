import { useLocalSearchParams } from "expo-router";

import { DetailScreen } from "@/pages/app/artwork/screens/DetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DetailScreen id={id} />;
}
