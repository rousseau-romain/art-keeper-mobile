/**
 * The new-artwork wizard is now one route per step (photo → location → details →
 * review), so "current step" is derived from the focused route name rather than a
 * `useState` machine. `DISPLAY_TOTAL` includes the success step so the header
 * counter reads "n/5" across the four input steps, matching the mockups.
 */
export const DISPLAY_TOTAL = 5;

/** Maps each step route's name (as seen by the nested Stack) to its step number. */
export const STEP_BY_ROUTE: Record<string, number> = {
  index: 1,
  location: 2,
  details: 3,
  review: 4,
};
