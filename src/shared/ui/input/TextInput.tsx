import { StyleSheet, View } from "react-native";

import { Input, type InputProps } from "@/shared/ui/input/Input";
import { Text } from "@/shared/ui/text/Text";
import { SpacingEnum } from "@/theme/enums/scale.enums";

export type TextInputProps = InputProps & {
  label: string;
  error?: string;
};

export const TextInput = ({ label, error, ...input }: TextInputProps) => (
  <View style={styles.field}>
    <Text font="mono" size="xs" style={styles.fieldLabel}>
      {label}
    </Text>
    <Input {...input} isInvalid={!!error} />
    {error ? (
      <Text font="body" size="xs" color="danger">
        {error}
      </Text>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  field: { gap: SpacingEnum.sm },
  fieldLabel: { textTransform: "uppercase" },
});
