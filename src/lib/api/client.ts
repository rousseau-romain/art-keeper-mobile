import createFetchClient, { type Middleware } from "openapi-fetch";
import { Platform } from "react-native";
import { getToken, setToken } from "../auth/token-store";
import i18n, { deviceLanguage } from "../i18n";
import type { paths } from "./schema";

const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

// Android emulators reach the host machine through 10.0.2.2, not localhost /
// 127.0.0.1 (those resolve to the emulator itself). Rewrite only the loopback
// host; real devices should point EXPO_PUBLIC_API_URL at the machine's LAN IP.
export const API_BASE_URL =
  Platform.OS === "android"
    ? RAW_API_URL.replace(/localhost|127\.0\.0\.1/, "10.0.2.2")
    : RAW_API_URL;

// Better Auth rejects state-changing auth calls with a missing/null Origin (its
// CSRF guard). Native fetch sends no Origin, so we attach one explicitly; it
// must be a value the server trusts (its baseURL is always trusted), hence the
// canonical URL — not the 10.0.2.2 connection alias above.
const AUTH_ORIGIN = process.env.EXPO_PUBLIC_AUTH_ORIGIN ?? RAW_API_URL;

/** Error carrying the server-provided `message` for inline display (400/401/422…). */
export class ApiError extends Error {
  status: number;
  /** Stable machine code from the body (e.g. "EMAIL_NOT_VERIFIED"), when present. */
  code?: string;
  body: unknown;
  constructor(status: number, message: string, body: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/** Build an ApiError from a non-ok response, preferring the server's `message`/`code`. */
function toApiError(status: number, body: unknown): ApiError {
  const isObj = body !== null && typeof body === "object";
  const message =
    isObj && "message" in body
      ? String((body as { message: unknown }).message)
      : `Request failed (${status})`;
  const code =
    isObj && "code" in body
      ? String((body as { code: unknown }).code)
      : undefined;
  return new ApiError(status, message, body, code);
}

/** A repeatable query value array (e.g. `tag`) or a scalar. */
export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | (string | number)[];
export type Query = Record<string, QueryValue>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  /** JSON body (ignored when `form` is set). */
  body?: unknown;
  /** multipart/form-data body. */
  form?: FormData;
  query?: Query;
  /** Send Authorization header (default true). */
  auth?: boolean;
  /** Expose response headers to the caller (e.g. to read set-auth-token). */
  onResponse?: (res: Response) => void;
}

function buildQuery(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) params.append(key, String(v));
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Track the UI language so the backend localizes responses (errors, etc.) to
// match — including a manual override. Falls back to the device locale.
function acceptLanguage(): string {
  return i18n.language || deviceLanguage();
}

/** Low-level request. Returns parsed JSON (or undefined for 204). */
export async function apiRequest<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, form, query, auth = true, onResponse } = opts;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": acceptLanguage(),
  };
  // Browsers set (and forbid overriding) Origin themselves; only native needs it.
  if (Platform.OS !== "web") headers.Origin = AUTH_ORIGIN;
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (form) {
    payload = form as unknown as BodyInit; // RN sets the multipart boundary itself
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: payload,
    // On web the session lives in a cookie (the `set-auth-token` header can't be
    // read across origins unless the server expose-lists it), so we must opt in
    // to storing/sending it. No-op on native, where the bearer token is used.
    credentials: "include",
  });
  onResponse?.(res);

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;

  if (!res.ok) throw toApiError(res.status, data);
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Paginated envelope used by list endpoints. */
export interface Paginated<T> {
  data: T[];
  nextCursor: string | null;
}

// --- Typed OpenAPI client -------------------------------------------------
// Same behaviour as `apiRequest` (bearer token, native Origin, Accept-Language,
// token capture, ApiError), but driven by the generated `schema.d.ts` so every
// path/param/response is typed. `apiRequest` stays for anything not in the spec.

const authMiddleware: Middleware = {
  onRequest({ request }) {
    const token = getToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    // Browsers set (and forbid overriding) Origin themselves; only native needs it.
    if (Platform.OS !== "web") request.headers.set("Origin", AUTH_ORIGIN);
    request.headers.set("Accept-Language", acceptLanguage());
    return request;
  },
  async onResponse({ response }) {
    // Better Auth returns the bearer token in this header on sign-in (native).
    const issued = response.headers.get("set-auth-token");
    if (issued) await setToken(issued);
    // Throw here (outside openapi-fetch's try/catch) so the call rejects with an
    // ApiError that React Query surfaces as the error state.
    if (!response.ok) {
      const body = await response
        .clone()
        .json()
        .catch(() => undefined);
      throw toApiError(response.status, body);
    }
    // Return nothing: we never replace the response, only read a header off it.
    // openapi-fetch treats a truthy return as a replacement and requires it to
    // be `instanceof Response` — which fails in the RN/Hermes runtime (the fetch
    // polyfill's Response isn't recognized), so returning `response` here threw
    // "onResponse: must return new Response()" on every successful 2xx call.
    return undefined;
  },
};

/** Typed fetch client. Use `fetchClient.GET("/path", …)` for imperative calls. */
export const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
});
fetchClient.use(authMiddleware);
