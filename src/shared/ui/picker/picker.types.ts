/** One selectable option in a {@link Picker}. */
export type PickerOption<T extends string | number = string> = {
  label: string;
  value: T;
};

/** Props for the cross-platform native {@link Picker}. */
export type PickerProps<T extends string | number = string> = {
  /** The currently selected value (must match one option's `value`). */
  value: T;
  /** Called with the newly selected value. */
  onChange: (next: T) => void;
  /** The available options, in display order. */
  options: readonly PickerOption<T>[];
  /** Accessibility label (applied on iOS/web; Android uses the visible label). */
  accessibilityLabel?: string;
};
