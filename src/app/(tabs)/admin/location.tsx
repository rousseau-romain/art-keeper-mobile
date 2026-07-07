import { useLocalSearchParams } from "expo-router";

import { LocationSheetScreen } from "@/pages/app/moderation/screens/LocationSheetScreen";

export default function Screen() {
  const { lat, lng } = useLocalSearchParams<{ lat: string; lng: string }>();
  return <LocationSheetScreen latitude={Number(lat)} longitude={Number(lng)} />;
}
