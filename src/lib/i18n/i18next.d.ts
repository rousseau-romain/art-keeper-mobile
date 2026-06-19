import "i18next";

import type { Resources } from "./locales/en.constant";

// Make `t("...")` keys type-checked against the English dictionary.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: Resources };
  }
}
