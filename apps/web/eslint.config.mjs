import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import i18next from "eslint-plugin-i18next";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...nextTypescript,
  i18next.configs["flat/recommended"],
  {
    rules: {
      /**
       * No copy inside a component.
       *
       * The catalogue check catches Chinese literals; this catches the Latin
       * ones it cannot see. The attribute list covers our own copy-carrying
       * props as well as the HTML ones — a hardcoded label="Email address"
       * reaches a Chinese reader untranslated exactly like a JSX text node
       * would.
       *
       * The rare literal that genuinely is not copy takes an eslint-disable
       * with a reason; review treats one without a reason as a defect.
       */
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            include: [
              "alt",
              "aria-description",
              "aria-label",
              "description",
              "heading",
              "hint",
              "label",
              "note",
              "placeholder",
              "summary",
              "title",
            ],
          },
          // Setting this replaces the plugin's defaults rather than adding to
          // them, so the translator itself has to be listed or every t("key")
          // is reported as the literal it is looking for.
          callees: {
            exclude: [
              "t",
              "getTranslations",
              "useTranslations",
              "i18n(ext)?",
              "console.*",
              "require",
              "addEventListener",
              "removeEventListener",
              "postMessage",
              "getElementById",
              "includes",
              "indexOf",
              "endsWith",
              "startsWith",
            ],
          },
        },
      ],
    },
  },
];

export default config;
