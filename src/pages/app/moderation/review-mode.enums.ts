/** How an admin decides on a proposal on the mobile review screen (a persisted
 * user setting): `swipe` → swipe the card left/right (reveal-then-confirm, no
 * footer buttons), `button` → the footer accept/reject buttons (no swipe). Read
 * this through `useReviewMode`; it only affects the narrow (mobile) layout — the
 * wide layout always uses buttons. */
export const ReviewModeEnum = {
  swipe: "swipe",
  button: "button",
} as const;

export type ReviewModeEnumType = keyof typeof ReviewModeEnum;
