import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  Text,
  TextButton,
} from "@expo/ui/jetpack-compose";
import { useState } from "react";

import type { PickerProps } from "@/shared/ui/picker/picker.types";

export type { PickerOption, PickerProps } from "@/shared/ui/picker/picker.types";

/**
 * Android variant of {@link Picker}. The universal `@expo/ui` picker anchors on
 * a full-width Material `TextField`; here a compact `TextButton` opens a Material
 * `DropdownMenu`, so the control is only as wide as its label — matching the iOS
 * SwiftUI menu (`Picker.tsx`). `accessibilityLabel` is unused on Android (the
 * visible button label is the accessible name; the jetpack `Host` takes none).
 */
export const Picker = <T extends string | number>({
  value,
  onChange,
  options,
}: PickerProps<T>) => {
  const [expanded, setExpanded] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <Host matchContents>
      <DropdownMenu
        expanded={expanded}
        onDismissRequest={() => setExpanded(false)}
      >
        <DropdownMenu.Trigger>
          <TextButton onClick={() => setExpanded(true)}>
            <Text>{selected?.label ?? ""}</Text>
          </TextButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {options.map((option) => (
            <DropdownMenuItem
              key={String(option.value)}
              onClick={() => {
                onChange(option.value);
                setExpanded(false);
              }}
            >
              <DropdownMenuItem.Text>
                <Text>{option.label}</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
};
