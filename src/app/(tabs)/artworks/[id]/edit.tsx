import { useLocalSearchParams } from "expo-router";

import { EditScreen } from "@/pages/app/artwork/screens/EditScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditScreen id={id} />;
}
