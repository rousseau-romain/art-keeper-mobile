import { Platform } from "react-native";

/**
 * True while rendering on the web server (`web.output: "server"`).
 *
 * Detected by platform + absent window, never by `typeof window` alone: that is
 * also `undefined` on native, so the bare check would misreport every native
 * render as a server render.
 *
 * Use it to guard anything that writes to module scope. The server runs
 * concurrent requests through the same module instances, so a module-level
 * write there is shared across visitors — the leak the per-request QueryClient
 * (`lib/query.ts`) and the muted `setToken` (`lib/api/client.ts`) both exist to
 * prevent. Reads of client-only storage need no guard: `localStorage` is simply
 * absent on the server.
 */
export const isServerRender = (): boolean =>
  Platform.OS === "web" && typeof window === "undefined";
