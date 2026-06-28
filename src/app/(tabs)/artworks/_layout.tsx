import { useTranslation } from "react-i18next";

import { Stack } from "@/shared/ui/stack/Stack";

export default function ArtworksLayout() {
  const { t: tr } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: tr("artwork.tab") }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{ title: tr("artwork.title.detail") }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{ title: tr("artwork.title.edit") }}
      />
    </Stack>
  );
}
