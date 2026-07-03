import { Picker as ExpoPicker, Host } from "@expo/ui";

import type { PickerProps } from "@/shared/ui/picker/picker.types";

export type {
  PickerOption,
  PickerProps,
} from "@/shared/ui/picker/picker.types";

/**
 * A compact, native single-select — a SwiftUI menu on iOS and a `<select>` on
 * web (via `@expo/ui`; Android has its own `Picker.android.tsx`). Options are
 * declared as data (`options`), not JSX, so callers stay declarative.
 */
export const Picker = <T extends string | number>({
  value,
  onChange,
  options,
  accessibilityLabel,
}: PickerProps<T>) => (
  <Host matchContents accessibilityLabel={accessibilityLabel}>
    <ExpoPicker
      appearance="menu"
      selectedValue={value}
      onValueChange={(next) => onChange(next as T)}
    >
      {options.map((option) => (
        <ExpoPicker.Item
          key={String(option.value)}
          label={option.label}
          value={option.value}
        />
      ))}
    </ExpoPicker>
  </Host>
);
