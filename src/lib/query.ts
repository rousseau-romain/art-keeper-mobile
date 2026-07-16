import { QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";

import { ApiError } from "./api/client";

/** Fresh QueryClient with the app's default options. */
export const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          // Don't retry auth/client errors; only transient ones.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });

let clientSingleton: QueryClient | undefined;

// Web server rendering (React Native's global has no `window`, so detect the
// server by platform + absent window — not `typeof window` alone, which is also
// undefined on native).
const isServerRender = Platform.OS === "web" && typeof window === "undefined";

/**
 * One QueryClient per server request, a single shared one everywhere else.
 *
 * Web server rendering (`web.output: "server"`) runs the React tree per request;
 * a module-singleton client would share its cache across concurrent requests and
 * leak one visitor's data into another's response. So on the server we always
 * build a fresh client; in the browser and on native we memoize one for the
 * app's lifetime (native especially must never rebuild it per render). See the
 * TanStack Query SSR guide.
 */
export const getQueryClient = (): QueryClient => {
  if (isServerRender) return makeQueryClient();
  if (!clientSingleton) clientSingleton = makeQueryClient();
  return clientSingleton;
};
