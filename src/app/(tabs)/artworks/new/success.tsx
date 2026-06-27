import { useLocalSearchParams } from "expo-router";

import { SuccessScreen } from "@/pages/app/artwork/screens/SuccessScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SuccessScreen id={id} />;
}
