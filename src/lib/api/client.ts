import { Platform } from "react-native";
import { getToken, setToken } from "@/lib/auth/token-store";
import i18n, { deviceLanguage } from "@/lib/i18n";
import { isServerRender } from "@/lib/is-server-render";
import { client } from "./generated/client.gen";

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

export type RequestOptions = {
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
};

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
export const apiRequest = async <T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> => {
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
};

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Paginated envelope used by list endpoints. */
export type Paginated<T> = {
  data: T[];
  nextCursor: string | null;
};

// --- Generated client configuration ---------------------------------------
// The generated SDK + TanStack Query helpers (src/lib/api/generated) all run
// through this single `@hey-api/client-fetch` instance. We configure it once at
// module load and register interceptors that reproduce the same behaviour as
// `apiRequest`: inject the bearer token, native Origin, and Accept-Language,
// capture the `set-auth-token` header, and throw `ApiError` on non-2xx.
//
// Importing this module is what wires the client, so it must load before any
// request — `src/app/_layout.tsx` imports it for that side effect.

// `throwOnError: true` makes every SDK call reject on non-2xx rather than
// resolving to `{ data: undefined, error }`. Without it, the `ApiError` thrown
// by the response interceptor below is caught by the client and surfaced only
// on `error` — so callers that read just `{ data }` swallow failures silently
// (the cause of the "sign-in does nothing on EMAIL_NOT_VERIFIED" bug). The
// generated TanStack hooks already pass this per-call; making it the default
// covers the hand-written wrappers in `auth.ts` too.
client.setConfig({
  baseUrl: API_BASE_URL,
  credentials: "include",
  throwOnError: true,
});

// Request interceptor: must return the (possibly-modified) Request.
client.interceptors.request.use((request) => {
  const token = getToken();
  if (token) request.headers.set("Authorization", `Bearer ${token}`);
  // Browsers set (and forbid overriding) Origin themselves; only native needs it.
  if (Platform.OS !== "web") request.headers.set("Origin", AUTH_ORIGIN);
  request.headers.set("Accept-Language", acceptLanguage());
  return request;
});

// Response interceptor: must return the Response (or throw). Unlike openapi-fetch,
// hey-api has no `instanceof Response` replacement check, so returning the same
// response is safe under Hermes. We throw `ApiError` here so the call rejects
// with it before the client's own (untyped) error handling runs.
client.interceptors.response.use(async (response) => {
  // Better Auth returns the bearer token in this header on sign-in (native).
  // Never capture it during a server render: `setToken` writes `token-store`'s
  // module-level mirror, which the web server shares across concurrent requests
  // — one visitor's token would then sign another's SSR fetch. The server
  // authenticates by forwarding the request's own cookie per call instead (see
  // the artwork route loaders), so it has no use for the mirror.
  const issued = response.headers.get("set-auth-token");
  if (issued && !isServerRender()) await setToken(issued);
  if (!response.ok) {
    const body = await response
      .clone()
      .json()
      .catch(() => undefined);
    throw toApiError(response.status, body);
  }
  return response;
});
