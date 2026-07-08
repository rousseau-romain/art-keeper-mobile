import { useLocalSearchParams } from "expo-router";

import { EditProposalLayout } from "@/pages/app/artwork/components/edit-proposal-layout/EditProposalLayout";
import { formsheetOptions } from "@/shared/navigation/formsheet-options.constant";
import { Stack } from "@/shared/ui/stack/Stack";

// A stack hosting a form sheet declares its anchor so a deep link to the sheet
// has the edit screen rendered behind it.
export const unstable_settings = {
  initialRouteName: "index",
};

export default function EditLayout() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <EditProposalLayout slug={slug}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="location"
          options={{ ...formsheetOptions, headerShown: false }}
        />
      </Stack>
    </EditProposalLayout>
  );
}
