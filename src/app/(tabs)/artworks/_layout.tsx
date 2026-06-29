import { useTranslation } from "react-i18next";
import { formsheetOptions } from "@/shared/navigation/formsheet-options.constant";
import { Stack } from "@/shared/ui/stack/Stack";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function ArtworksLayout() {
  const { t: tr } = useTranslation();
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: tr("artwork.tab") }}
      />
      <Stack.Screen
        name="[slug]/index"
        options={{ title: tr("artwork.title.detail") }}
      />
      <Stack.Screen
        name="[slug]/edit"
        options={{ title: tr("artwork.title.edit") }}
      />
      <Stack.Screen
        name="filters"
        options={{ ...formsheetOptions, headerShown: false }}
      />
    </Stack>
  );
}
