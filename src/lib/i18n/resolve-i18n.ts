import type { i18n as I18nInstance } from "i18next";

import i18nSingleton from "./index";

/**
 * The i18next instance that backs `<I18nextProvider>`. Native (and the web
 * browser, via `.web.ts`) use the device-locale singleton; only the web SSR
 * render swaps in a per-request Accept-Language instance.
 */
export const resolveI18n = (): I18nInstance => i18nSingleton;
