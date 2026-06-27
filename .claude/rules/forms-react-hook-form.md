# Rule: forms use react-hook-form + the `input/` components

Form state lives in **react-hook-form** (`useForm`) — never per-field `useState`,
a hand-rolled `canSubmit`, or a manual `submitting` flag. This mirrors the data
layer split: server state stays in the TanStack Query cache
([data-fetching](data-fetching.md)), and *form* state lives in the form, not in
ad-hoc component state. The reference is `src/app/(auth)/login.tsx`.

## The form

- **Type the values and always pass `defaultValues`**:

  ```ts
  type LoginValues = { name: string; email: string; password: string };

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LoginValues>({
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "" },
  });
  ```

  `mode: "onTouched"` surfaces a field's error after it's been blurred, so the
  user gets feedback without the form screaming on first render.

- **Submit** is `handleSubmit(async (values) => { … })` — RHF runs validation
  first and only calls the callback with valid values. Drive the submit
  `<Button loading={isSubmitting} />` from `formState.isSubmitting`; **don't**
  add a `submitting` `useState` or a `disabled={!canSubmit}` guard — RHF blocks
  an invalid submit and tracks pending state for you.
- **Reset** with `reset()` (e.g. switching sign-in ⇄ create, or "back to sign
  in") — not per-field setters.
- State that isn't a form field (a `mode` toggle, a server `error` string, a
  `verifyEmail` panel flag) stays in `useState` — only the **fields** move into
  the form.

## Binding to inputs — always `<Controller>`

React Native inputs have no `register`/ref story, so every field is a
`<Controller>` whose render prop wires the RHF `field` to the input and surfaces
`fieldState.error`:

```tsx
<Controller
  control={control}
  name="email"
  rules={{
    required: tr("auth.errors.emailRequired"),
    pattern: { value: EMAIL_PATTERN, message: tr("auth.errors.emailInvalid") },
  }}
  render={({ field, fieldState }) => (
    <EmailInput
      label={tr("auth.emailLabel")}
      value={field.value}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>
```

Map `field.onChange → onChangeText`, `field.onBlur → onBlur`,
`field.value → value`, and `fieldState.error?.message → error`. The keyboard /
autofill props and placeholder come from the specialized input (`EmailInput`
here), not the call site — see the input components below. Inside an extracted
`{Name}Form` (next section) the `<Controller>` pulls `control` from
`useFormContext` instead of taking it as a prop.

## Extract the fields into a `{Name}Form` component

A form is its **own component**, not a wall of `<Controller>`s inlined in the
screen. As soon as a screen needs a form, extract the fields:

- **Location**: `src/pages/app/<feature>/form/<Name>Form.tsx` — a `form/` bucket
  in the domain folder, beside `screens/` / `components/` / `hooks/`
  ([app-route-page-screens](app-route-page-screens.md)). The component is named
  `<Name>Form` (`ArtworkForm`, `LoginForm`), a `const` arrow export in its own
  file. (`src/app/**` stays route-only — the form never lives there.)
- **Split of duties**: the **screen** owns the form lifecycle — it calls
  `useForm`, wraps the tree in `<FormProvider {...methods}>`, wires the submit
  (from a `use<Name>Submit` hook — [see below](#extract-the-submit-and-screen-actions-into-hooks)),
  and renders the submit `<Button>`. The **`<Name>Form`** owns only the fields:
  it renders one `<Controller>` per field and reads the form via
  **`useFormContext`** — it **never** receives `control` (or any form method) as
  a prop.

```tsx
// screen (src/pages/app/artwork/screens/NewScreen.tsx) — owns useForm + wiring
const methods = useForm<ArtworkValues>({ mode: "onTouched", defaultValues });
const { onSubmit } = useArtworkSubmit({ methods }); // submit lives in a hook
return (
  <FormProvider {...methods}>
    <ArtworkForm />
    <Button loading={methods.formState.isSubmitting} onPress={onSubmit} />
  </FormProvider>
);

// src/pages/app/artwork/form/ArtworkForm.tsx — owns the fields, no props
export const ArtworkForm = () => {
  const { control } = useFormContext<ArtworkValues>();
  return (
    <>
      <Controller control={control} name="title" rules={{ … }} render={…} />
      {/* …one <Controller> per field… */}
    </>
  );
};
```

`useFormContext<XValues>()` keeps the form component decoupled and typed without
prop-drilling `control` through layout wrappers; pull `control` (and
`formState` / `watch` / … as needed) from it. The inline `useForm` destructure
shown in [The form](#the-form) is the **single small form** shortcut — a real
form screen uses the `FormProvider` + `{Name}Form` split above.

## Extract the submit (and screen actions) into `hooks/`

The screen file holds **no async handler bodies** — every `handleSubmit`
callback and every screen action (`onGoogle`, `onResend`, a delete, …) lives in
a hook under `src/pages/app/<feature>/hooks/use<X>.ts`. The screen calls the
hooks and binds the returned `on*` to the UI; it has no `try/catch`.

- **The submit hook** — `use<Name>Submit({ methods, …flags })` wraps
  `methods.handleSubmit`, runs the mutation, and **owns the state the submit
  drives**: the server `error` string plus any flow flag (`verifyEmail`, …). It
  returns `{ onSubmit, error, setError, … }`. UI inputs it needs (an `isCreate`
  mode) come in as **params**, not form fields.
- **One hook per other action.** Each async action is its own sibling hook
  returning `{ onX, xPending }` and owning its own deps (`useRouter`,
  `useToast`, the API). Shared state stays in **one** hook; siblings take only
  what crosses the boundary as a param — a `setError` setter, a value — they
  don't re-own it (`useGoogleSignIn({ setError })`,
  `useResendVerification({ email })`).
- These flow hooks live in the domain **`hooks/`** bucket even though a single
  screen uses them — they're that screen's logic, lifted out so the screen file
  is layout + wiring. The screen ends up with just `useForm`, a `mode`/UI
  `useState`, and the hook calls. Reference: `src/pages/app/auth/hooks/`
  (`useLoginSubmit`, `useGoogleSignIn`, `useResendVerification`).

So a form screen is **four pieces**: the route (`src/app/**`, thin), the screen
(layout + wiring), the `{Name}Form` (the `<Controller>` fields), and the flow
hooks (submit + actions).

## Validation — built-in `rules`, translated messages

- Use react-hook-form's **built-in `rules`** (`required`, `pattern`,
  `minLength`, …). **No** `zod` / `@hookform/resolvers` — that dependency was
  deliberately not added; don't reach for a schema library for these forms.
- Every rule message is **translated** ([i18n-translation](i18n-translation.md)),
  grouped under the namespace's `errors` object — `t("auth.errors.emailInvalid")`,
  never a literal. Add the key to both `en` and `fr`.
- A field that's only present in one mode carries a **conditional** rule so it
  can't block the other flow — e.g. `name` is required only when creating:
  `rules={{ required: isCreate ? tr("auth.errors.nameRequired") : false }}`.

## The input components (`src/shared/ui/input/`)

A small family that composes upward, each its own component file
([component-module-structure](component-module-structure.md)):

- **`Input` (`input/Input.tsx`)** — the primitive: a bare styled `RNTextInput`
  (the RN import is aliased so the export can own the name). It holds **all** the
  static input styling and takes an `invalid?: boolean` that drives only the
  border color (the one prop-state-driven value, kept inline per
  [styling-stylesheet](styling-stylesheet.md)). It also forwards a `ref` to the
  underlying `RNTextInput` so a previous field can `.focus()` it (see
  [Keyboard handling](#keyboard-handling)). `InputProps = RNTextInputProps &
  { invalid?: boolean; debounce?: number; ref?: Ref<RNTextInput> }`.
- **`TextInput` (`input/TextInput.tsx`)** — the labelled field: composes `Input`,
  adding the uppercase mono label above and the error message below. It maps its
  `error?: string` to `<Input invalid={!!error} />`. `TextInputProps = InputProps
  & { label: string; error?: string }`.
- **`EmailInput` / `PasswordInput` (`input/EmailInput.tsx`,
  `input/PasswordInput.tsx`)** — thin type-specialized wrappers over `TextInput`
  that **preset** the type's keyboard / autofill props, and a sensible default
  `placeholder` where one fits (email: `keyboardType` / `inputMode` /
  `autoComplete` / `textContentType` / `autoCapitalize="none"` + a
  `you@example.com` placeholder; password: `secureTextEntry` + the password
  autofill props). `{...props}` is spread **last** so every preset — including
  the placeholder — stays overridable per call; `XInputProps = TextInputProps`.
  Prefer these in a form over hand-setting the same props on a `TextInput`, and
  pass only what's specific to the field (the `label`, the RHF `field` wiring,
  the `error`).

In a form, render the most specific input that fits inside the `<Controller>`
(`EmailInput` for an email field, `PasswordInput` for a password, otherwise
`TextInput`); reach for the bare `Input` only when you need an unlabelled input.
All follow the usual conventions — exported `type {Component}Props`
([types-not-interface](types-not-interface.md)), `const` arrow export
([export-const-functions](export-const-functions.md)), deep `@/` imports
([import-path-alias](import-path-alias.md)), and each its own module-scope
`StyleSheet`.

### Debouncing

Every input accepts `debounce?: number` (ms) — it flows through the whole family
from `Input`. When set, the field updates **instantly** (a local mirror drives
the visible text) but `onChangeText` fires only after the delay; `0` (the
default) is a pure passthrough with no behavior change. Use it for an input whose
change is expensive — a search/filter query, or an RHF field with async
validation — not for ordinary form fields, which stay un-debounced.

## Keyboard handling

A form screen must stay usable while the soft keyboard is up — the focused field
and the submit/footer must never sit under the keyboard.

### Wrap the screen in `KeyboardAvoidingView`

The **screen** (not the `{Name}Form`) wraps its scroll + footer in a
`KeyboardAvoidingView`, exactly as `src/pages/app/auth/screens/LoginScreen.tsx`
and `src/pages/app/artwork/screens/DetailsStepScreen.tsx` do:

```tsx
<KeyboardAvoidingView
  style={styles.screen} // flex: 1 + bg
  behavior={Platform.OS === "ios" ? "padding" : undefined}
>
  <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
    {/* fields */}
  </ScrollView>
  <WizardFooter … /> {/* in-flow footer — padding lifts it above the keyboard */}
</KeyboardAvoidingView>
```

- `behavior="padding"` on **iOS**, `undefined` on **Android** (the OS soft-input
  resize handles it) — never a constant `"padding"` for both.
- The inner `ScrollView` keeps `keyboardShouldPersistTaps="handled"` so a tap
  registers while the keyboard is open instead of just dismissing it.
- The `KeyboardAvoidingView` is the flex root (`flex: 1`); don't also nest a
  `flex: 1` `<View>` inside it just to hold the same style.
- No `keyboardVerticalOffset` is needed even with a custom screen header (the
  content begins below it); add one only if testing shows the field still tucked
  under the keyboard.

### Return-key navigation — `returnKeyType="next"` + forwarded `ref`

Chain single-line fields so the keyboard's **Next** key moves to the following
input without dismissing the keyboard. Hold a `ref` to the *next* field and point
the current field's `onSubmitEditing` at it:

```tsx
const artistRef = useRef<RNTextInput>(null); // import { type TextInput as RNTextInput }

// title field — advance to the artist field on "next"
<TextInput
  …
  returnKeyType="next"
  submitBehavior="submit"               // keep the keyboard up (don't blur)
  onSubmitEditing={() => artistRef.current?.focus()}
/>

// next field receives the ref (Input/TextInput forward it to RNTextInput)
<ArtistAutocomplete ref={artistRef} … />
```

- `submitBehavior="submit"` keeps the keyboard open across the focus hop (the
  old `blurOnSubmit={false}`); use `returnKeyType="done"` on the last single-line
  field. A **multiline** field (a note) is the natural terminus — Return inserts
  a newline there, so don't chain past it.
- The `ref` is a normal prop in React 19 — **no `forwardRef`**. A composed input
  that wraps the family (e.g. `ArtistAutocomplete`) re-declares `ref?:
  Ref<RNTextInput>` on its props and passes it straight to its inner `TextInput`,
  keeping the forward chain `Input → TextInput → composed input`. Such a wrapper
  also re-exposes `onSubmitEditing` so the chain can continue *through* it to the
  next field.
- Reference: `src/pages/app/artwork/form/ArtworkForm.tsx` (title → artist → note,
  the note being the multiline terminus).
