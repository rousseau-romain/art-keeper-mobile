import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { ColorEnum } from "@/theme/enums/color.enums";
import { FONTS } from "@/theme/fonts.constant";

export default function ArtworksLayout() {
  const { t: tr } = useTranslation();
  return (
    <Stack
      screenOptions={{
        headerStyle: styles.header,
        headerTintColor: ColorEnum.accent,
        headerTitleStyle: styles.headerTitle,
        contentStyle: styles.content,
      }}
    >
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
      <Stack.Screen
        name="new"
        options={{ headerShown: false, title: tr("artwork.title.new") }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: ColorEnum.surface },
  headerTitle: { fontFamily: FONTS.display, color: ColorEnum.ink },
  content: { backgroundColor: ColorEnum.bg },
});
