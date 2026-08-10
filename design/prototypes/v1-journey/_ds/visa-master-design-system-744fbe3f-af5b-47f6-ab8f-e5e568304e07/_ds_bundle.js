/* @ds-bundle: {"format":4,"namespace":"VisaMasterDesignSystem_744fbe","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Callout","sourcePath":"components/core/Callout.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Locale","sourcePath":"components/core/i18n.jsx"},{"name":"ICON_SVG","sourcePath":"components/core/icons.data.js"},{"name":"ICON_NAMES","sourcePath":"components/core/icons.data.js"},{"name":"LANGUAGE_NAMES","sourcePath":"components/core/languages.js"},{"name":"LOCALES","sourcePath":"components/core/strings.js"},{"name":"CATALOGUE","sourcePath":"components/core/strings.js"},{"name":"DeviceHandoff","sourcePath":"components/feedback/DeviceHandoff.jsx"},{"name":"SaveResumeNotice","sourcePath":"components/feedback/SaveResumeNotice.jsx"},{"name":"Sheet","sourcePath":"components/feedback/Sheet.jsx"},{"name":"WeChatEscape","sourcePath":"components/feedback/WeChatEscape.jsx"},{"name":"CheckboxGroup","sourcePath":"components/forms/CheckboxGroup.jsx"},{"name":"ChoiceRow","sourcePath":"components/forms/ChoiceRow.jsx"},{"name":"DateInput","sourcePath":"components/forms/DateInput.jsx"},{"name":"ErrorSummary","sourcePath":"components/forms/ErrorSummary.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Input.jsx"},{"name":"Question","sourcePath":"components/forms/Question.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/RadioGroup.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"BackLink","sourcePath":"components/navigation/BackLink.jsx"},{"name":"LanguageSwitcher","sourcePath":"components/navigation/LanguageSwitcher.jsx"},{"name":"PIPELINE_STAGES","sourcePath":"components/navigation/PipelineProgress.jsx"},{"name":"PipelineProgress","sourcePath":"components/navigation/PipelineProgress.jsx"},{"name":"SiteFooter","sourcePath":"components/navigation/SiteFooter.jsx"},{"name":"Wordmark","sourcePath":"components/navigation/SiteHeader.jsx"},{"name":"SiteHeader","sourcePath":"components/navigation/SiteHeader.jsx"},{"name":"StepProgress","sourcePath":"components/navigation/StepProgress.jsx"},{"name":"StickyActionBar","sourcePath":"components/navigation/StickyActionBar.jsx"},{"name":"TaskList","sourcePath":"components/navigation/TaskList.jsx"},{"name":"CameraCaptureLoop","sourcePath":"components/pack/CameraCaptureLoop.jsx"},{"name":"CitationPanel","sourcePath":"components/pack/CitationPanel.jsx"},{"name":"ConsistencyReport","sourcePath":"components/pack/ConsistencyReport.jsx"},{"name":"FilePreview","sourcePath":"components/pack/FilePreview.jsx"},{"name":"PackFileTree","sourcePath":"components/pack/PackFileTree.jsx"},{"name":"ResumableUploader","sourcePath":"components/pack/ResumableUploader.jsx"},{"name":"TrustRow","sourcePath":"components/pack/TrustRow.jsx"},{"name":"UploadChecklist","sourcePath":"components/pack/UploadChecklist.jsx"}],"sourceHashes":{".build/build-icons.mjs":"beb3ccbd9d63",".build/check-i18n.mjs":"4b62a89f2579","components/core/Badge.jsx":"c31709b6f93c","components/core/Button.jsx":"9cb07286339a","components/core/Callout.jsx":"68991f1b6c66","components/core/Card.jsx":"c6bea9fcbd08","components/core/Icon.jsx":"8880d6106550","components/core/IconButton.jsx":"eb0c880490f2","components/core/i18n.jsx":"19e5da0e1907","components/core/icons.data.js":"39137220b046","components/core/languages.js":"92b3e6a86168","components/core/strings.js":"cafc32297872","components/feedback/DeviceHandoff.jsx":"56e26d324a70","components/feedback/SaveResumeNotice.jsx":"951aa41966c7","components/feedback/Sheet.jsx":"4be2665a4eda","components/feedback/WeChatEscape.jsx":"2afa7538e889","components/forms/CheckboxGroup.jsx":"ec0c5c3d4fca","components/forms/ChoiceRow.jsx":"e7363cc3f337","components/forms/DateInput.jsx":"6bd6cb47e1e0","components/forms/ErrorSummary.jsx":"d1f5271509e6","components/forms/Input.jsx":"8b794d663686","components/forms/Question.jsx":"5673b73c1176","components/forms/RadioGroup.jsx":"45e0c9b1383a","components/forms/Select.jsx":"c812a8fd7c35","components/navigation/BackLink.jsx":"c36ca16385de","components/navigation/LanguageSwitcher.jsx":"fb6c65f4d15f","components/navigation/PipelineProgress.jsx":"5fc37d42c03c","components/navigation/SiteFooter.jsx":"acce97a9c168","components/navigation/SiteHeader.jsx":"1339c637c68c","components/navigation/StepProgress.jsx":"a1bf90005658","components/navigation/StickyActionBar.jsx":"a29fdcd3d9bd","components/navigation/TaskList.jsx":"46e9d494b55c","components/pack/CameraCaptureLoop.jsx":"de4aaedade42","components/pack/CitationPanel.jsx":"592a7f7ae922","components/pack/ConsistencyReport.jsx":"2284749521a7","components/pack/FilePreview.jsx":"564389dfbfd8","components/pack/PackFileTree.jsx":"23f015a5171b","components/pack/ResumableUploader.jsx":"83b50dd1fc0b","components/pack/TrustRow.jsx":"02e28bf9b230","components/pack/UploadChecklist.jsx":"9eb9f09073e9","ui_kits/app/AppHeader.jsx":"167dac150024","ui_kits/app/IntakeStep.jsx":"0323959ef50d","ui_kits/app/PackDelivery.jsx":"58d302c4d2d1","ui_kits/app/UploadStep.jsx":"436f3285cb2a","ui_kits/app/copy.jsx":"77488ae7f481","ui_kits/marketing/Home.jsx":"8fbcb2c1d88f","ui_kits/marketing/copy.jsx":"3faebdb6351d"},"inlinedExternals":[],"unexposedExports":[{"name":"has","sourcePath":"components/core/i18n.jsx"},{"name":"isWeChat","sourcePath":"components/feedback/WeChatEscape.jsx"},{"name":"languageName","sourcePath":"components/core/languages.js"},{"name":"t","sourcePath":"components/core/i18n.jsx"}]} */

(() => {

const __ds_ns = (window.VisaMasterDesignSystem_744fbe = window.VisaMasterDesignSystem_744fbe || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// .build/build-icons.mjs
try { (() => {
/* Regenerates components/core/icons.data.js from assets/icons/*.svg, so the glyphs are
 * compiled into _ds_bundle.js and ride with it. Run after adding or replacing an icon:
 *
 *   node .build/build-icons.mjs
 *
 * Icons come from Lucide 0.475.0 and are self-hosted; nothing is ever fetched from a CDN.
 */
/* Node-only; see the guard at the bottom. */
async function main() {
  const {
    readdirSync,
    readFileSync,
    writeFileSync
  } = await import("node:fs");
  const {
    join
  } = await import("node:path");

  /* Run from the project root: node .build/<script>.mjs */
  const ROOT = process.cwd();
  const SRC = join(ROOT, "assets/icons");
  const OUT = join(ROOT, "components/core/icons.data.js");
  const names = readdirSync(SRC).filter(f => f.endsWith(".svg")).map(f => f.slice(0, -4)).sort();
  const entries = names.map(n => `  ${JSON.stringify(n)}: ${JSON.stringify(readFileSync(join(SRC, n + ".svg"), "utf8").replace(/\n\s*/g, "").trim())},`);
  writeFileSync(OUT, `/* GENERATED — do not edit by hand. Source of truth: assets/icons/*.svg (Lucide 0.475.0).
     Regenerate with: node .build/build-icons.mjs

     The glyphs are embedded here, as source, so they compile into _ds_bundle.js and
     travel with it. A consuming project that loads only the bundle gets every icon:
     nothing has to be copied out of assets/, and there is no second network request
     for a mainland connection to drop. */
  export const ICON_SVG = {
  ${entries.join("\n")}
  };
  export const ICON_NAMES = Object.keys(ICON_SVG);
  `);
  console.log(`icons: embedded ${names.length} glyphs into ${OUT.replace(ROOT + "/", "")}`);
}
if (typeof process !== "undefined" && process.versions && process.versions.node) main();
})(); } catch (e) { __ds_ns.__errors.push({ path: ".build/build-icons.mjs", error: String((e && e.message) || e) }); }

// .build/check-i18n.mjs
try { (() => {
/* Build-time i18n check for the Visa Master design system.
 *
 *   node .build/check-i18n.mjs        # exits 1 on any error
 *
 * It fails the build on:
 *   1. a user-facing string literal in a component — CJK anywhere, JSX text nodes,
 *      and literals in aria-label / placeholder / title / alt / label / hint
 *   2. a t("key") that is not in the catalogue
 *   3. a catalogue key missing from any locale, or empty in one
 *   4. placeholders that differ between locales for the same key
 * Warnings (do not fail): keys nothing references.
 *
 * There is no fallback path anywhere: an untranslated key breaks the build here and
 * throws in the browser. That is the point — a Chinese string in the English UI is a
 * defect users see, and this file is what makes it impossible to ship one.
 *
 * Escape hatch, for the rare literal that is genuinely not copy:
 *   const CODE = "A4"; // i18n-exempt: paper size, not copy
 */
/* Node-only. The design-system bundler compiles every .js/.mjs in the project, so the
   whole script lives inside main() behind a Node guard: in a browser it is never called. */
async function main() {
  const {
    readdirSync,
    readFileSync,
    statSync
  } = await import("node:fs");
  const {
    join,
    relative,
    sep
  } = await import("node:path");
  const {
    pathToFileURL
  } = await import("node:url");

  /* Run from the project root: node .build/<script>.mjs */
  const ROOT = process.cwd();
  const SCAN_DIR = join(ROOT, "components");
  /* Not scanned: the catalogue itself, and language self-names, which are proper nouns
     written in their own script in every locale. */
  const SKIP = new Set(["strings.js", "languages.js", "icons.data.js"]);
  const UI_ATTRS = /\b(aria-label|placeholder|title|alt|label|hint|heading|summary|description|confirmLabel|cancelLabel)\s*=\s*("[^"]*"|'[^']*')/g;
  const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/;
  const errors = [];
  const warnings = [];
  const usedKeys = new Set();
  const referenced = new Set();
  function walk(dir, out = []) {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p, out);else if (/\.(jsx?|tsx?)$/.test(name) && !/\.d\.ts$/.test(name) && !SKIP.has(name)) out.push(p);
    }
    return out;
  }

  /* Replace comments and string/template literals with same-length blanks, keeping a
     record of each literal. Regex scanning after that is reliable: no apostrophes,
     no ">" inside strings, no copy hiding in a comment. */
  function scan(src) {
    const literals = [];
    let out = "";
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (c === "/" && src[i + 1] === "/") {
        const j = src.indexOf("\n", i);
        const e = j < 0 ? src.length : j;
        out += src.slice(i, e).replace(/[^\n]/g, " ");
        i = e;
        continue;
      }
      if (c === "/" && src[i + 1] === "*") {
        const j = src.indexOf("*/", i + 2);
        const e = j < 0 ? src.length : j + 2;
        out += src.slice(i, e).replace(/[^\n]/g, " ");
        i = e;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        const start = i;
        const q = c;
        i++;
        while (i < src.length) {
          if (src[i] === "\\") {
            i += 2;
            continue;
          }
          if (src[i] === q) {
            i++;
            break;
          }
          if (q === "`" && src[i] === "$" && src[i + 1] === "{") {
            let d = 1;
            i += 2;
            while (i < src.length && d > 0) {
              if (src[i] === "{") d++;else if (src[i] === "}") d--;
              i++;
            }
            continue;
          }
          i++;
        }
        const text = src.slice(start, i);
        literals.push({
          index: start,
          text
        });
        out += text.replace(/[^\n]/g, " ");
        continue;
      }
      out += c;
      i++;
    }
    return {
      blanked: out,
      literals
    };
  }
  const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;
  const exempt = (src, idx) => /i18n-exempt/.test(src.split("\n")[lineOf(src, idx) - 1]);
  for (const file of walk(SCAN_DIR)) {
    const rel = relative(ROOT, file).split(sep).join("/");
    const src = readFileSync(file, "utf8");
    const {
      blanked,
      literals
    } = scan(src);
    const at = idx => `${rel}:${lineOf(src, idx)}`;
    for (const {
      index,
      text
    } of literals) {
      if (exempt(src, index)) continue;
      if (CJK.test(text)) errors.push(`${at(index)}  Chinese string literal outside the catalogue: ${text.trim().slice(0, 60)}`);
    }
    for (const m of blanked.matchAll(/>([^<>{}]*[A-Za-z\u4e00-\u9fff][^<>{}]*)</g)) {
      const idx = m.index + 1;
      if (exempt(src, idx)) continue;
      errors.push(`${at(idx)}  JSX text node — copy belongs in the catalogue: ${m[1].trim().slice(0, 60)}`);
    }
    for (const m of src.matchAll(UI_ATTRS)) {
      const body = m[2].slice(1, -1).trim();
      if (!body || !/[A-Za-z\u4e00-\u9fff]/.test(body)) continue;
      if (exempt(src, m.index)) continue;
      errors.push(`${at(m.index)}  literal in a user-facing attribute (${m[1]}): ${body.slice(0, 60)}`);
    }
    for (const m of src.matchAll(/\bt\(\s*["'`]([^"'`]+)["'`]/g)) usedKeys.add(m[1]);
    /* Keys also reach t() through a lookup table — STATUS[x].key, STAGE_KEY[name] — so any
       quoted string counts as a reference when scoring which keys nothing uses. */
    for (const m of src.matchAll(/["'`]([^"'`\n]+)["'`]/g)) referenced.add(m[1]);
  }
  const {
    CATALOGUE,
    LOCALES
  } = await import(pathToFileURL(join(ROOT, "components/core/strings.js")).href);
  const placeholders = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(",");
  const base = LOCALES[0];
  const allKeys = new Set(LOCALES.flatMap(l => Object.keys(CATALOGUE[l] || {})));
  for (const key of [...allKeys].sort()) {
    for (const loc of LOCALES) {
      const v = (CATALOGUE[loc] || {})[key];
      if (v === undefined) {
        errors.push(`strings.js  key "${key}" is missing from locale "${loc}"`);
        continue;
      }
      if (typeof v !== "string" || !v.trim()) {
        errors.push(`strings.js  key "${key}" is empty in locale "${loc}"`);
        continue;
      }
      if (loc !== base && CATALOGUE[base][key] && placeholders(v) !== placeholders(CATALOGUE[base][key])) errors.push(`strings.js  key "${key}" has different placeholders in "${loc}" (${placeholders(v) || "none"}) and "${base}" (${placeholders(CATALOGUE[base][key]) || "none"})`);
    }
  }
  for (const key of usedKeys) {
    const ok = allKeys.has(key) || allKeys.has(key + "_one") || allKeys.has(key + "_other");
    if (!ok) errors.push(`t("${key}") has no entry in the catalogue`);
  }
  for (const key of allKeys) {
    const stem = key.replace(/_(one|other)$/, "");
    const seen = usedKeys.has(key) || usedKeys.has(stem) || referenced.has(key) || referenced.has(stem);
    if (!seen) warnings.push(`unused key "${key}"`);
  }
  for (const w of warnings) console.warn("warn  " + w);
  if (errors.length) {
    console.error(`\ni18n check FAILED — ${errors.length} problem${errors.length > 1 ? "s" : ""}:\n`);
    for (const e of errors) console.error("  " + e);
    console.error("\nCopy lives in components/core/strings.js and is read with t(). Nothing else.\n");
    process.exit(1);
  }
  console.log(`i18n check passed — ${allKeys.size} keys x ${LOCALES.length} locales, ${usedKeys.size} referenced.`);
}
if (typeof process !== "undefined" && process.versions && process.versions.node) main();
})(); } catch (e) { __ds_ns.__errors.push({ path: ".build/check-i18n.mjs", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** White panel on the blue-grey page. Border first, shadow only when it floats. */
function Card({
  children,
  padding = "var(--space-6)",
  elevation = 1,
  tone = "default",
  header,
  footer,
  style,
  ...rest
}) {
  const tones = {
    default: {
      bg: "var(--surface-card)",
      bd: "var(--border-subtle)"
    },
    accent: {
      bg: "var(--surface-accent-soft)",
      bd: "var(--blue-100)"
    },
    sunken: {
      bg: "var(--surface-sunken)",
      bd: "var(--border-subtle)"
    },
    inverse: {
      bg: "var(--surface-inverse)",
      bd: "var(--blue-800)"
    }
  };
  const t = tones[tone] || tones.default;
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: t.bg,
      border: `1px solid ${t.bd}`,
      borderRadius: "var(--radius-card)",
      boxShadow: elevation === 0 ? "none" : elevation === 2 ? "var(--shadow-2)" : "var(--shadow-1)",
      overflow: "hidden",
      color: tone === "inverse" ? "var(--text-inverse)" : undefined,
      ...style
    }
  }, rest), header ? /*#__PURE__*/React.createElement("header", {
    style: {
      padding: `var(--space-4) ${padding}`,
      borderBottom: `1px solid ${t.bd}`,
      fontSize: "var(--fs-16)",
      fontWeight: "var(--fw-semibold)",
      color: tone === "inverse" ? "var(--text-inverse)" : "var(--text-heading)"
    }
  }, header) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding
    }
  }, children), footer ? /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: `var(--space-4) ${padding}`,
      borderTop: `1px solid ${t.bd}`,
      background: tone === "default" ? "var(--ink-50)" : "transparent"
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/icons.data.js
try { (() => {
/* GENERATED — do not edit by hand. Source of truth: assets/icons/*.svg (Lucide 0.475.0).
   Regenerate with: node .build/build-icons.mjs

   The glyphs are embedded here, as source, so they compile into _ds_bundle.js and
   travel with it. A consuming project that loads only the bundle gets every icon:
   nothing has to be copied out of assets/, and there is no second network request
   for a mainland connection to drop. */
const ICON_SVG = {
  "arrow-left": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m12 19-7-7 7-7\"></path><path d=\"M19 12H5\"></path></svg>",
  "arrow-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"></path><path d=\"m12 5 7 7-7 7\"></path></svg>",
  "arrow-up-from-line": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m18 9-6-6-6 6\"></path><path d=\"M12 3v14\"></path><path d=\"M5 21h14\"></path></svg>",
  "banknote": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M6 12h.01M18 12h.01\"></path></svg>",
  "book-open-text": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 5v16\"></path><path d=\"M16 13h2\"></path><path d=\"M16 9h2\"></path><path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\"></path><path d=\"M6 13h2\"></path><path d=\"M6 9h2\"></path></svg>",
  "calendar": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 2v3\"></path><path d=\"M16 2v3\"></path><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"></rect><path d=\"M3 9h18\"></path></svg>",
  "camera": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\"></path><circle cx=\"12\" cy=\"13\" r=\"3\"></circle></svg>",
  "check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6 9 17l-5-5\"></path></svg>",
  "chevron-down": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m6 9 6 6 6-6\"></path></svg>",
  "chevron-left": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m15 18-6-6 6-6\"></path></svg>",
  "chevron-right": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m9 18 6-6-6-6\"></path></svg>",
  "chevron-up": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m18 15-6-6-6 6\"></path></svg>",
  "circle-alert": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"></line><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"></line></svg>",
  "circle-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path></svg>",
  "circle-dashed": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\"></path><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\"></path><path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\"></path><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\"></path><path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\"></path><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\"></path><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\"></path><path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\"></path></svg>",
  "circle-question-mark": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><path d=\"M12 17h.01\"></path></svg>",
  "clock": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 6v6l4 2\"></path></svg>",
  "cloud-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m17 15-5.5 5.5L9 18\"></path><path d=\"M5.516 16.07A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 3.501 7.327\"></path></svg>",
  "credit-card": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\"></rect><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\"></line></svg>",
  "download": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 15V3\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"m7 10 5 5 5-5\"></path></svg>",
  "external-link": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 3h6v6\"></path><path d=\"M10 14 21 3\"></path><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\"></path></svg>",
  "eye": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"></path><circle cx=\"12\" cy=\"12\" r=\"3\"></circle></svg>",
  "file": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path></svg>",
  "file-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"m9 15 2 2 4-4\"></path></svg>",
  "file-pen-line": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.364 13.634a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506l4.013-4.009a1 1 0 0 0-3.004-3.004z\"></path><path d=\"M14.487 7.858A1 1 0 0 1 14 7V2\"></path><path d=\"M20 19.645V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l2.516 2.516\"></path><path d=\"M8 18h1\"></path></svg>",
  "file-text": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path></svg>",
  "files": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 2h-4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8\"></path><path d=\"M16.706 2.706A2.4 2.4 0 0 0 15 2v5a1 1 0 0 0 1 1h5a2.4 2.4 0 0 0-.706-1.706z\"></path><path d=\"M5 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8a2 2 0 0 0 1.732-1\"></path></svg>",
  "folder": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"></path></svg>",
  "folder-open": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2\"></path></svg>",
  "git-compare-arrows": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"5\" cy=\"6\" r=\"3\"></circle><path d=\"M12 6h5a2 2 0 0 1 2 2v7\"></path><path d=\"m15 9-3-3 3-3\"></path><circle cx=\"19\" cy=\"18\" r=\"3\"></circle><path d=\"M12 18H7a2 2 0 0 1-2-2V9\"></path><path d=\"m9 15 3 3-3 3\"></path></svg>",
  "globe": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"></path><path d=\"M2 12h20\"></path></svg>",
  "id-card": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 10h2\"></path><path d=\"M16 14h2\"></path><path d=\"M6.17 15a3 3 0 0 1 5.66 0\"></path><circle cx=\"9\" cy=\"11\" r=\"2\"></circle><rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"></rect></svg>",
  "image": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"></rect><circle cx=\"9\" cy=\"9\" r=\"2\"></circle><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"></path></svg>",
  "info": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path></svg>",
  "languages": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m5 8 6 6\"></path><path d=\"m4 14 6-6 2-3\"></path><path d=\"M2 5h12\"></path><path d=\"M7 2h1\"></path><path d=\"m22 22-5-10-5 10\"></path><path d=\"M14 18h6\"></path></svg>",
  "link": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"></path><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"></path></svg>",
  "list-checks": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M13 5h8\"></path><path d=\"M13 12h8\"></path><path d=\"M13 19h8\"></path><path d=\"m3 17 2 2 4-4\"></path><path d=\"m3 7 2 2 4-4\"></path></svg>",
  "loader-circle": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 12a9 9 0 1 1-6.219-8.56\"></path></svg>",
  "lock": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path></svg>",
  "mail": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"></path><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"></rect></svg>",
  "menu": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 5h16\"></path><path d=\"M4 12h16\"></path><path d=\"M4 19h16\"></path></svg>",
  "message-circle-question-mark": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"></path><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><path d=\"M12 17h.01\"></path></svg>",
  "message-square": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 17a2 2 0 0 1-2 2H6l-4 4V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\"></path></svg>",
  "monitor": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"></rect><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"></line><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"></line></svg>",
  "paperclip": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551\"></path></svg>",
  "pause": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"></rect><rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"></rect></svg>",
  "pencil": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"></path><path d=\"m15 5 4 4\"></path></svg>",
  "plane": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z\"></path></svg>",
  "plus": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14\"></path><path d=\"M12 5v14\"></path></svg>",
  "printer": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"></path><path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\"></path><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\"></rect></svg>",
  "qr-code": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"5\" height=\"5\" x=\"3\" y=\"3\" rx=\"1\"></rect><rect width=\"5\" height=\"5\" x=\"16\" y=\"3\" rx=\"1\"></rect><rect width=\"5\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\"></rect><path d=\"M21 16h-3a2 2 0 0 0-2 2v3\"></path><path d=\"M21 21v.01\"></path><path d=\"M12 7v3a2 2 0 0 1-2 2H7\"></path><path d=\"M3 12h.01\"></path><path d=\"M12 3h.01\"></path><path d=\"M12 16v.01\"></path><path d=\"M16 12h1\"></path><path d=\"M21 12v.01\"></path><path d=\"M12 21v-1\"></path></svg>",
  "rotate-ccw": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"></path><path d=\"M3 3v5h5\"></path></svg>",
  "save": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z\"></path><path d=\"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7\"></path><path d=\"M7 3v4a1 1 0 0 0 1 1h7\"></path></svg>",
  "scan-line": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7V5a2 2 0 0 1 2-2h2\"></path><path d=\"M17 3h2a2 2 0 0 1 2 2v2\"></path><path d=\"M21 17v2a2 2 0 0 1-2 2h-2\"></path><path d=\"M7 21H5a2 2 0 0 1-2-2v-2\"></path><path d=\"M7 12h10\"></path></svg>",
  "shield-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path><path d=\"m9 12 2 2 4-4\"></path></svg>",
  "smartphone": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\"></rect><path d=\"M12 18h.01\"></path></svg>",
  "trash-2": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 11v6\"></path><path d=\"M14 11v6\"></path><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"></path><path d=\"M3 6h18\"></path><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"></path></svg>",
  "triangle-alert": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path></svg>",
  "upload": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3v12\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path></svg>",
  "user-check": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m16 11 2 2 4-4\"></path><path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"></path><circle cx=\"9\" cy=\"7\" r=\"4\"></circle></svg>",
  "x": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg>"
};
const ICON_NAMES = Object.keys(ICON_SVG);
Object.assign(__ds_scope, { ICON_SVG, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/icons.data.js", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
/* Icons ride INSIDE the bundle. The glyph source lives in icons.data.js (generated
   from assets/icons/*.svg), so a consuming project that loads _ds_bundle.js has every
   icon already — no assets/ copy step, no second request, nothing for a flaky mainland
   connection to drop mid-paint.

   assets/icons/ is still the source of truth for the SVGs themselves, and a name that
   is missing from the embedded set falls back to fetching it from there (override the
   folder with window.VM_ICON_BASE). In development an unknown name is loud, not blank. */
let ICON_BASE = null;
function iconBase() {
  if (ICON_BASE) return ICON_BASE;
  if (typeof window !== "undefined" && window.VM_ICON_BASE) return ICON_BASE = window.VM_ICON_BASE;
  if (typeof document !== "undefined") {
    const s = Array.from(document.querySelectorAll("script[src]")).find(x => /_ds_bundle\.js(\?|$)/.test(x.getAttribute("src") || ""));
    if (s) return ICON_BASE = new URL("assets/icons/", s.src).href;
  }
  return ICON_BASE = "assets/icons/";
}
const warned = new Set();
function maskUrl(name) {
  const svg = __ds_scope.ICON_SVG[name];
  if (svg) return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  if (!warned.has(name)) {
    warned.add(name);
    console.warn(`[visa-master] icon "${name}" is not in the bundle. Add assets/icons/${name}.svg and run node .build/build-icons.mjs.`);
  }
  return `url("${iconBase()}${name}.svg")`;
}

/** Masked Lucide glyph, embedded in the bundle. Inherits currentColor, so it tints with the text around it. */
function Icon({
  name,
  size = 20,
  className,
  style,
  title
}) {
  const url = maskUrl(name);
  return /*#__PURE__*/React.createElement("span", {
    role: title ? "img" : "presentation",
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
    className: className,
    style: {
      display: "inline-block",
      flex: "none",
      width: size,
      height: size,
      backgroundColor: "currentColor",
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: ["--status-neutral-fg", "--status-neutral-bg", "--status-neutral-border"],
  info: ["--status-info-fg", "--status-info-bg", "--status-info-border"],
  success: ["--status-success-fg", "--status-success-bg", "--status-success-border"],
  warning: ["--status-warning-fg", "--status-warning-bg", "--status-warning-border"],
  error: ["--status-error-fg", "--status-error-bg", "--status-error-border"]
};

/** Small status label. Error tone is muted on purpose — a missing file is a task, not an alarm. */
function Badge({
  children,
  tone = "neutral",
  icon,
  size = "md",
  style,
  ...rest
}) {
  const [fg, bg, bd] = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-1)",
      padding: size === "sm" ? "2px var(--space-2)" : "3px var(--space-3)",
      fontSize: size === "sm" ? "var(--fs-12)" : "var(--fs-14)",
      fontWeight: "var(--fw-medium)",
      letterSpacing: "var(--ls-cjk-sm)",
      lineHeight: 1.5,
      color: `var(${fg})`,
      background: `var(${bg})`,
      border: `1px solid var(${bd})`,
      borderRadius: "var(--radius-chip)",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === "sm" ? 12 : 14
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: "var(--control-h-sm)",
    px: "var(--space-3)",
    fs: "var(--fs-14)"
  },
  md: {
    h: "var(--control-h)",
    px: "var(--space-5)",
    fs: "var(--fs-16)"
  },
  lg: {
    h: "var(--control-h-lg)",
    px: "var(--space-6)",
    fs: "var(--fs-18)"
  }
};
const VARIANTS = {
  primary: {
    bg: "var(--action-primary)",
    fg: "var(--text-on-accent)",
    bd: "var(--action-primary)",
    hoverBg: "var(--action-primary-hover)",
    activeBg: "var(--action-primary-active)"
  },
  secondary: {
    bg: "var(--white)",
    fg: "var(--action-secondary-fg)",
    bd: "var(--action-secondary-border)",
    hoverBg: "var(--action-secondary-hover)",
    activeBg: "var(--blue-100)"
  },
  ghost: {
    bg: "transparent",
    fg: "var(--action-secondary-fg)",
    bd: "transparent",
    hoverBg: "var(--action-ghost-hover)",
    activeBg: "var(--ink-200)"
  },
  quiet: {
    bg: "transparent",
    fg: "var(--text-muted)",
    bd: "transparent",
    hoverBg: "var(--action-ghost-hover)",
    activeBg: "var(--ink-200)"
  }
};

/** The single action control. Primary is used once per view; the sticky bar owns it on mobile. */
function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconAfter,
  block,
  disabled,
  loading,
  as = "button",
  href,
  onClick,
  type = "button",
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const [a, setA] = React.useState(false);
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const Tag = as === "a" ? "a" : "button";
  const bg = disabled ? "var(--surface-disabled)" : a ? v.activeBg : h ? v.hoverBg : v.bg;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    type: Tag === "button" ? type : undefined,
    disabled: Tag === "button" ? disabled || loading : undefined,
    onClick: onClick,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => {
      setH(false);
      setA(false);
    },
    onMouseDown: () => setA(true),
    onMouseUp: () => setA(false),
    style: {
      display: block ? "flex" : "inline-flex",
      width: block ? "100%" : undefined,
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-2)",
      minHeight: s.h,
      minWidth: "var(--touch-min)",
      padding: `0 ${s.px}`,
      fontSize: s.fs,
      fontWeight: "var(--fw-medium)",
      lineHeight: 1.2,
      letterSpacing: "var(--ls-cjk-body)",
      fontFamily: "var(--font-sans)",
      color: disabled ? "var(--text-faint)" : v.fg,
      background: bg,
      border: `1px solid ${disabled ? "var(--border-subtle)" : v.bd}`,
      borderRadius: "var(--radius-control)",
      textDecoration: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "var(--transition-control)",
      boxShadow: variant === "primary" && !disabled ? "var(--shadow-1)" : "none",
      ...style
    }
  }, rest), loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader-circle",
    size: 18,
    style: {
      animation: "vm-spin 1s linear infinite"
    }
  }) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  }) : null, /*#__PURE__*/React.createElement("span", null, children), iconAfter ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconAfter,
    size: 18
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  info: {
    fg: "var(--status-info-fg)",
    bg: "var(--status-info-bg)",
    bar: "var(--blue-500)",
    icon: "info"
  },
  success: {
    fg: "var(--status-success-fg)",
    bg: "var(--status-success-bg)",
    bar: "var(--green-500)",
    icon: "check"
  },
  warning: {
    fg: "var(--status-warning-fg)",
    bg: "var(--status-warning-bg)",
    bar: "var(--amber-500)",
    icon: "triangle-alert"
  },
  error: {
    fg: "var(--status-error-fg)",
    bg: "var(--status-error-bg)",
    bar: "var(--red-500)",
    icon: "circle-alert"
  },
  quiet: {
    fg: "var(--text-muted)",
    bg: "transparent",
    bar: "var(--border-default)",
    icon: null
  }
};

/** Inline explanation block. GOV.UK inset-text shape: left rule, no rounded pill, no icon-only meaning. */
function Callout({
  children,
  tone = "info",
  title,
  icon,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.info;
  const glyph = icon === null ? null : icon || t.icon;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      gap: "var(--space-3)",
      padding: "var(--space-4) var(--space-4) var(--space-4) var(--space-4)",
      background: t.bg,
      borderLeft: `4px solid ${t.bar}`,
      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
      fontSize: "var(--fs-16)",
      lineHeight: "var(--lh-body)",
      color: "var(--text-body)",
      ...style
    }
  }, rest), glyph ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: glyph,
    size: 20,
    style: {
      color: t.fg,
      marginTop: 3
    }
  }) : null, /*#__PURE__*/React.createElement("div", null, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: "var(--fw-semibold)",
      color: t.fg,
      marginBottom: "var(--space-1)"
    }
  }, title) : null, /*#__PURE__*/React.createElement("div", null, children)));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Callout.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Square 44x44 icon-only control. Always pass `label` — it is the accessible name. */
function IconButton({
  icon,
  label,
  size = 44,
  variant = "ghost",
  onClick,
  disabled,
  style,
  ...rest
}) {
  const [h, setH] = React.useState(false);
  const bg = variant === "solid" ? "var(--white)" : "transparent";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    onClick: onClick,
    disabled: disabled,
    onMouseEnter: () => setH(true),
    onMouseLeave: () => setH(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      padding: 0,
      color: disabled ? "var(--text-faint)" : "var(--text-muted)",
      background: h && !disabled ? "var(--action-ghost-hover)" : bg,
      border: variant === "solid" ? "1px solid var(--border-subtle)" : "1px solid transparent",
      borderRadius: "var(--radius-control)",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "var(--transition-control)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(size * 0.45)
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/languages.js
try { (() => {
/* Language self-names. NOT translated and NOT in the catalogue: a language is written
   in its own script, in every locale. 德语 is "Deutsch" to a German consulate whether the
   interface is Chinese or English. Used by PackFileTree's per-file language label and by
   LanguageSwitcher. */
const LANGUAGE_NAMES = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  "en-GB": "English",
  "en-US": "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  ru: "Русский",
  ja: "日本語",
  ko: "한국어",
  th: "ไทย",
  vi: "Tiếng Việt",
  ar: "العربية",
  tr: "Türkçe",
  pl: "Polski",
  cs: "Čeština",
  el: "Ελληνικά",
  sv: "Svenska",
  da: "Dansk",
  fi: "Suomi",
  no: "Norsk",
  hu: "Magyar"
};

/** Self-name for a language tag. Falls back to the tag itself, never to the UI language. */
function languageName(code) {
  if (!code) return null;
  return LANGUAGE_NAMES[code] || LANGUAGE_NAMES[String(code).split("-")[0]] || code;
}
Object.assign(__ds_scope, { LANGUAGE_NAMES, languageName });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/languages.js", error: String((e && e.message) || e) }); }

// components/core/strings.js
try { (() => {
/* The string catalogue. THE ONLY place user-facing copy is allowed to live.
   Chinese is the source language; every key must exist in every locale listed in
   LOCALES with the same {placeholders}. A missing key is a build failure, not a
   silent fallback — see .build/check-i18n.mjs.

   Plurals: define <key>_one and <key>_other and call t(key, { count }).
   Proper nouns that are never translated (language self-names) live in languages.js. */

const LOCALES = ["zh-CN", "en"];
const CATALOGUE = {
  "zh-CN": {
    "common.close": "关闭",
    "common.copy": "复制链接",
    "common.copied": "已复制",
    "language.groupLabel": "界面语言",
    "language.note": "仅切换界面语言。材料包内文件用哪种语言，由目的地国家的要求决定。",
    "nav.back": "返回上一步",
    "nav.menu": "菜单",
    "date.year": "年",
    "date.month": "月",
    "date.day": "日",
    "errorSummary.title": "请先补充以下内容",
    "progress.stepOfTotal": "第 {step} / {total} 步",
    "save.justNow": "刚刚",
    "save.saved": "已保存（{when}）。你可以随时关闭页面，之后继续填写。",
    "save.sendLink": "把续填链接发到 {email}",
    "save.sendLinkNoEmail": "把续填链接发到邮箱",
    "camera.guide": "把整页放进取景框，四个角都要在框内",
    "camera.page": "第 {n} 页",
    "camera.capture": "拍摄这一页",
    "camera.deletePage": "删除第 {n} 页",
    "camera.moveEarlier": "前移",
    "camera.moveLater": "后移",
    "camera.captured": "已拍 {n} 页",
    "camera.reorderHint": "长按拖动可调整顺序",
    "citations.title": "来源与提醒",
    "citations.checkedAt": "核对于 {date}",
    "consistency.conflict": "需要确认",
    "consistency.check": "建议核对",
    "consistency.pass": "一致",
    "consistency.fix": "去修改",
    "file.printA4": "A4 单面打印，黑白即可",
    "file.pages_one": "{count} 页",
    "file.pages_other": "{count} 页",
    "upload.hint": "支持 JPG、PNG、PDF，单个文件不超过 20MB",
    "upload.dropzone": "把文件拖到这里，或点击选择",
    "upload.resumeNote": "上传中断后会从断点继续，不用重新开始",
    "upload.resume": "继续上传",
    "upload.interrupted": "网络中断，已保留 {progress}%。点“继续上传”接着传。",
    "upload.replace": "替换",
    "upload.upload": "上传",
    "uploadState.done": "已收到",
    "uploadState.checking": "识别中",
    "uploadState.todo": "待上传",
    "uploadState.redo": "需要重传",
    "uploadState.optional": "可选",
    "packStatus.ready": "已生成",
    "packStatus.review": "人工复核中",
    "packStatus.waiting": "待你补充",
    "packStatus.official": "官方原件",
    "packTree.languageNote": "每份文件都标注了它自己的语言。文件语言由目的地国家决定，与你正在阅读的界面语言无关。",
    "packTree.languageAria": "文件语言：{language}",
    "packTree.languageUnknown": "语言待定",
    "wechat.title": "请在浏览器中打开",
    "wechat.body.payment": "微信内无法完成支付。点右上角的“···”，选择“在浏览器中打开”，支付页会带着你的进度一起打开。",
    "wechat.body.download": "微信内无法下载文件。点右上角的“···”，选择“在浏览器中打开”，材料包会带着你的进度一起打开。",
    "wechat.body.alipay": "微信内无法跳转支付宝。点右上角的“···”，选择“在浏览器中打开”，再回来付款。",
    "wechat.hint": "找不到“···”？它在屏幕右上角。",
    "wechat.tokenNote": "链接里带着一次性登录凭证，{minutes} 分钟内有效，只能用一次。不要转发给别人。",
    "wechat.dismiss": "我知道了",
    "handoff.title.continue": "换一台设备继续",
    "handoff.title.camera": "用手机拍摄",
    "handoff.body.continue": "扫码或打开链接，进度会一起带过去。这台设备可以继续用，不会掉线。",
    "handoff.body.camera": "用手机扫码拍摄，照片会直接出现在这个页面上，不用再传一次。",
    "handoff.codeLabel": "手动输入码",
    "handoff.codeHint": "在另一台设备上打开 {url}，输入上面的码。",
    "handoff.expires": "二维码 {minutes} 分钟内有效",
    "handoff.waiting": "等待另一台设备连接…",
    "handoff.connected": "已连接：{device}",
    "handoff.qrPlaceholder": "二维码",
    "pipeline.title": "材料包生成进度",
    "pipeline.stageOf": "第 {n} / {total} 阶段",
    "pipeline.stage.sources": "官方来源核对",
    "pipeline.stage.generate": "材料生成",
    "pipeline.stage.consistency": "一致性检查",
    "pipeline.stage.review": "人工复核",
    "pipeline.state.done": "已完成",
    "pipeline.state.active": "进行中",
    "pipeline.state.pending": "等待中",
    "pipeline.state.blocked": "需要你处理",
    "pipeline.eta": "预计还需 {minutes} 分钟",
    "pipeline.leaveNote": "可以关闭页面。完成后我们会用邮件和短信通知你，链接还是这一个。",
    "tasklist.summary": "已完成 {done} / {total} 个部分",
    "tasklist.state.done": "已完成",
    "tasklist.state.progress": "进行中",
    "tasklist.state.todo": "未开始",
    "tasklist.state.locked": "暂不可填",
    "tasklist.state.problem": "需要修改",
    "tasklist.lockedHint": "完成“{section}”之后才能填这一部分。",
    "tasklist.itemsDone": "{done} / {total}"
  },
  en: {
    "common.close": "Close",
    "common.copy": "Copy link",
    "common.copied": "Copied",
    "language.groupLabel": "Interface language",
    "language.note": "Changes the interface language only. The language of the documents in your pack is set by the destination country’s requirements.",
    "nav.back": "Back to the previous step",
    "nav.menu": "Menu",
    "date.year": "Year",
    "date.month": "Month",
    "date.day": "Day",
    "errorSummary.title": "There is something to fix before you continue",
    "progress.stepOfTotal": "Step {step} of {total}",
    "save.justNow": "just now",
    "save.saved": "Saved {when}. You can close this page and pick up where you left off.",
    "save.sendLink": "Send the resume link to {email}",
    "save.sendLinkNoEmail": "Email me the resume link",
    "camera.guide": "Fit the whole page in the frame, all four corners inside",
    "camera.page": "Page {n}",
    "camera.capture": "Capture this page",
    "camera.deletePage": "Delete page {n}",
    "camera.moveEarlier": "Move earlier",
    "camera.moveLater": "Move later",
    "camera.captured": "{n} pages captured",
    "camera.reorderHint": "Press and hold a page to drag it into order",
    "citations.title": "Sources and caveats",
    "citations.checkedAt": "Checked {date}",
    "consistency.conflict": "Needs confirming",
    "consistency.check": "Worth checking",
    "consistency.pass": "Consistent",
    "consistency.fix": "Fix this",
    "file.printA4": "Print A4, single-sided; black and white is fine",
    "file.pages_one": "{count} page",
    "file.pages_other": "{count} pages",
    "upload.hint": "JPG, PNG and PDF. Up to 20MB per file.",
    "upload.dropzone": "Drag your files here, or click to choose",
    "upload.resumeNote": "If the upload is interrupted it resumes where it stopped — you do not start again.",
    "upload.resume": "Resume upload",
    "upload.interrupted": "Connection dropped at {progress}%. Choose “Resume upload” to carry on.",
    "upload.replace": "Replace",
    "upload.upload": "Upload",
    "uploadState.done": "Received",
    "uploadState.checking": "Reading it now",
    "uploadState.todo": "Not uploaded yet",
    "uploadState.redo": "Needs re-uploading",
    "uploadState.optional": "Optional",
    "packStatus.ready": "Generated",
    "packStatus.review": "In human review",
    "packStatus.waiting": "Waiting on you",
    "packStatus.official": "Official original",
    "packTree.languageNote": "Every file is labelled with its own language. The destination country sets that language; it is not the language you are reading the interface in.",
    "packTree.languageAria": "Document language: {language}",
    "packTree.languageUnknown": "Language to be confirmed",
    "wechat.title": "Open this page in your browser",
    "wechat.body.payment": "Payment cannot be completed inside WeChat. Tap “···” at the top right and choose “Open in Browser”. The payment page opens with your progress intact.",
    "wechat.body.download": "Files cannot be downloaded inside WeChat. Tap “···” at the top right and choose “Open in Browser”. Your pack opens with your progress intact.",
    "wechat.body.alipay": "WeChat will not hand off to Alipay. Tap “···” at the top right, choose “Open in Browser”, then come back to pay.",
    "wechat.hint": "Cannot find “···”? It is in the top-right corner of the screen.",
    "wechat.tokenNote": "The link carries a one-time sign-in token. It is valid for {minutes} minutes, works once, and should not be forwarded.",
    "wechat.dismiss": "Got it",
    "handoff.title.continue": "Continue on another device",
    "handoff.title.camera": "Use your phone as the camera",
    "handoff.body.continue": "Scan the code or open the link. Your progress travels with it, and this device stays signed in.",
    "handoff.body.camera": "Scan with your phone and shoot there. The photos appear on this page as you take them.",
    "handoff.codeLabel": "Type this code instead",
    "handoff.codeHint": "Open {url} on the other device and enter the code above.",
    "handoff.expires": "The code is valid for {minutes} minutes",
    "handoff.waiting": "Waiting for the other device…",
    "handoff.connected": "Connected: {device}",
    "handoff.qrPlaceholder": "QR code",
    "pipeline.title": "Pack progress",
    "pipeline.stageOf": "Stage {n} of {total}",
    "pipeline.stage.sources": "Checking official sources",
    "pipeline.stage.generate": "Generating your documents",
    "pipeline.stage.consistency": "Consistency check",
    "pipeline.stage.review": "Human review",
    "pipeline.state.done": "Done",
    "pipeline.state.active": "In progress",
    "pipeline.state.pending": "Waiting",
    "pipeline.state.blocked": "Needs you",
    "pipeline.eta": "About {minutes} minutes left",
    "pipeline.leaveNote": "You can close this page. We will email and text you when it is ready, using this same link.",
    "tasklist.summary": "You have completed {done} of {total} sections",
    "tasklist.state.done": "Completed",
    "tasklist.state.progress": "In progress",
    "tasklist.state.todo": "Not started",
    "tasklist.state.locked": "Cannot start yet",
    "tasklist.state.problem": "Needs fixing",
    "tasklist.lockedHint": "Available once you finish “{section}”.",
    "tasklist.itemsDone": "{done} / {total}"
  }
};
Object.assign(__ds_scope, { LOCALES, CATALOGUE });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/strings.js", error: String((e && e.message) || e) }); }

// components/core/i18n.jsx
try { (() => {
let LOCALE = "zh-CN";

/**
 * Locale for component microcopy. Setting it also sets `lang` on <html>, which is what
 * makes the Latin leading tokens (:lang(en)) apply. Chinese is the source language;
 * copy itself lives in strings.js, never in a component.
 */
const Locale = {
  available: __ds_scope.LOCALES,
  set(l) {
    LOCALE = __ds_scope.CATALOGUE[l] ? l : "zh-CN";
    if (typeof document !== "undefined" && document.documentElement) document.documentElement.lang = LOCALE;
  },
  get() {
    return LOCALE;
  },
  isEn() {
    return LOCALE.slice(0, 2) === "en";
  }
};
function fail(msg) {
  // No silent fallback. A missing translation is a bug that .build/check-i18n.mjs
  // fails the build on; if one reaches the browser it must be just as visible.
  throw new Error("[visa-master i18n] " + msg);
}

/**
 * t("packStatus.ready") — look up catalogue copy for the current locale.
 * t("camera.page", { n: 3 }) — fill {placeholders}.
 * t("file.pages", { count: 2 }) — picks <key>_one / <key>_other.
 */
function t(key, vars) {
  const table = __ds_scope.CATALOGUE[LOCALE] || fail(`unknown locale "${LOCALE}"`);
  let k = key;
  if (vars && vars.count !== undefined && table[key] === undefined) {
    k = Number(vars.count) === 1 ? `${key}_one` : `${key}_other`;
  }
  const raw = table[k];
  if (raw === undefined) fail(`missing key "${k}" in locale "${LOCALE}"`);
  return raw.replace(/\{(\w+)\}/g, (m, name) => {
    const v = vars ? vars[name] : undefined;
    if (v === undefined || v === null) fail(`key "${k}" needs {${name}}`);
    return String(v);
  });
}

/** Does the current locale have this key? For optional copy, e.g. a per-country note. */
function has(key) {
  const table = __ds_scope.CATALOGUE[LOCALE];
  return !!table && table[key] !== undefined;
}
Object.assign(__ds_scope, { Locale, t, has });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/i18n.jsx", error: String((e && e.message) || e) }); }

// components/feedback/DeviceHandoff.jsx
try { (() => {
/**
 * Cross-device handoff. Two shapes, one component:
 *   mode="continue" — carry the session to another device at any long step. A normal
 *     choice (phone on the train, desktop at home), offered everywhere, not a fallback.
 *   mode="camera"   — a desktop session borrows the phone's camera; shots land here.
 *
 * The QR itself is rendered by the app (`qrSrc`: a data-URI or blob the server signs),
 * because the code carries a one-time token this design system must not mint. Without it
 * the slot shows the typed code, which is always offered as an equal path — QR scanning
 * fails often enough on older Android that a code-only route cannot be the fallback.
 */
function DeviceHandoff({
  mode = "continue",
  url,
  code,
  qrSrc,
  minutes = 15,
  state,
  device,
  onCopy,
  style
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (url && typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    if (onCopy) onCopy(url);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-5)",
      padding: "var(--space-5)",
      background: "var(--white)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none",
      display: "grid",
      gap: "var(--space-2)",
      justifyItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 148,
      height: 148,
      display: "grid",
      placeItems: "center",
      padding: "var(--space-2)",
      background: "var(--white)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)"
    }
  }, qrSrc ? /*#__PURE__*/React.createElement("img", {
    src: qrSrc,
    alt: __ds_scope.t("handoff.qrPlaceholder"),
    width: 128,
    height: 128,
    style: {
      display: "block",
      width: 128,
      height: 128,
      imageRendering: "pixelated"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      display: "grid",
      gap: 6,
      justifyItems: "center",
      color: "var(--text-faint)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "qr-code",
    size: 40
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-12)"
    }
  }, __ds_scope.t("handoff.qrPlaceholder")))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)"
    }
  }, __ds_scope.t("handoff.expires", {
    minutes
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 260px",
      minWidth: 0,
      display: "grid",
      gap: "var(--space-3)",
      alignContent: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: mode === "camera" ? "camera" : "smartphone",
    size: 18,
    style: {
      color: "var(--blue-600)"
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--fs-18)",
      lineHeight: 1.5,
      color: "var(--text-heading)"
    }
  }, __ds_scope.t(mode === "camera" ? "handoff.title.camera" : "handoff.title.continue"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-14)",
      lineHeight: 1.8,
      color: "var(--text-muted)",
      maxWidth: "var(--measure-prose)"
    }
  }, __ds_scope.t(mode === "camera" ? "handoff.body.camera" : "handoff.body.continue")), code ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)"
    }
  }, __ds_scope.t("handoff.codeLabel")), /*#__PURE__*/React.createElement("span", {
    style: {
      justifySelf: "start",
      padding: "var(--space-2) var(--space-3)",
      background: "var(--ink-50)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-num)",
      fontSize: "var(--fs-20)",
      letterSpacing: ".16em",
      color: "var(--text-heading)"
    }
  }, code), url ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)",
      lineHeight: 1.7
    }
  }, __ds_scope.t("handoff.codeHint", {
    url: String(url).replace(/^https?:\/\//, "").split("?")[0]
  })) : null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      flexWrap: "wrap"
    }
  }, url ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: copy,
    style: {
      minHeight: 36,
      padding: "0 var(--space-4)",
      background: "var(--white)",
      border: "1px solid var(--action-secondary-border)",
      borderRadius: "var(--radius-control)",
      color: "var(--action-secondary-fg)",
      fontSize: "var(--fs-14)",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: copied ? "check" : "link",
    size: 15
  }), copied ? __ds_scope.t("common.copied") : __ds_scope.t("common.copy")) : null, state ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: "var(--fs-14)",
      color: state === "connected" ? "var(--green-600)" : "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: state === "connected" ? "circle-check" : "loader-circle",
    size: 15
  }), state === "connected" ? __ds_scope.t("handoff.connected", {
    device: device || __ds_scope.t("handoff.qrPlaceholder")
  }) : __ds_scope.t("handoff.waiting")) : null)));
}
Object.assign(__ds_scope, { DeviceHandoff });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/DeviceHandoff.jsx", error: String((e && e.message) || e) }); }

// components/feedback/SaveResumeNotice.jsx
try { (() => {
/** Quiet confirmation that the answer is stored and the link back is theirs to keep. */
function SaveResumeNotice({
  savedAt,
  email,
  onSend,
  style
}) {
  const when = savedAt !== undefined ? savedAt : __ds_scope.t("save.justNow");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      flexWrap: "wrap",
      padding: "var(--space-3) var(--space-4)",
      background: "var(--surface-teal-soft)",
      border: "1px solid var(--teal-100)",
      borderRadius: "var(--radius-card)",
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "cloud-check",
    size: 18,
    style: {
      color: "var(--teal-600)"
    }
  }), /*#__PURE__*/React.createElement("span", null, __ds_scope.t("save.saved", {
    when
  })), onSend ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSend,
    style: {
      marginLeft: "auto",
      minHeight: 32,
      padding: "0 var(--space-3)",
      background: "transparent",
      border: "1px solid var(--teal-300)",
      borderRadius: "var(--radius-control)",
      color: "var(--teal-700)",
      fontSize: "var(--fs-14)",
      cursor: "pointer"
    }
  }, email ? __ds_scope.t("save.sendLink", {
    email
  }) : __ds_scope.t("save.sendLinkNoEmail")) : null);
}
Object.assign(__ds_scope, { SaveResumeNotice });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/SaveResumeNotice.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Sheet.jsx
try { (() => {
/**
 * One overlay component, two presentations. Below 768px it is a bottom sheet with a
 * drag handle; above, a centred dialog. Never a centred modal on a phone.
 */
function Sheet({
  open,
  title,
  description,
  children,
  actions,
  onClose,
  mode
}) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width:767px)");
    const f = () => setIsMobile(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  if (!open) return null;
  const sheet = mode ? mode === "sheet" : isMobile;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title,
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 60,
      display: "flex",
      alignItems: sheet ? "flex-end" : "center",
      justifyContent: "center",
      background: "rgba(11,37,69,.44)",
      backdropFilter: "blur(2px)"
    },
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: sheet ? "100%" : "min(520px,92%)",
      maxHeight: sheet ? "88%" : "84%",
      overflow: "auto",
      background: "var(--surface-card)",
      borderRadius: sheet ? "var(--radius-sheet) var(--radius-sheet) 0 0" : "var(--radius-card)",
      boxShadow: sheet ? "var(--shadow-sheet)" : "var(--shadow-3)",
      padding: `var(--space-5) var(--space-5) calc(var(--space-5) + var(--safe-bottom))`,
      animation: `vm-${sheet ? "rise" : "fade"} var(--dur-sheet) var(--ease-out)`
    }
  }, sheet ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 4,
      borderRadius: 2,
      background: "var(--ink-300)",
      margin: "0 auto var(--space-4)"
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-20)",
      lineHeight: 1.45
    }
  }, title), !sheet && onClose ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": __ds_scope.t("common.close"),
    onClick: onClose,
    style: {
      width: 36,
      height: 36,
      border: 0,
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 20
  })) : null), description ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-2)",
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)",
      lineHeight: 1.7
    }
  }, description) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-4)"
    }
  }, children), actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: sheet ? "column" : "row",
      justifyContent: "flex-end",
      gap: "var(--space-3)",
      marginTop: "var(--space-6)"
    }
  }, actions) : null));
}
Object.assign(__ds_scope, { Sheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Sheet.jsx", error: String((e && e.message) || e) }); }

// components/feedback/WeChatEscape.jsx
try { (() => {
/** True inside the WeChat webview, where downloads and Alipay handoffs both die silently. */
function isWeChat(ua) {
  const s = ua || (typeof navigator !== "undefined" ? navigator.userAgent : "");
  return /MicroMessenger/i.test(s);
}
const BODY = {
  payment: "wechat.body.payment",
  download: "wechat.body.download",
  alipay: "wechat.body.alipay"
};

/**
 * The one escape hatch out of the WeChat webview. Downloads and Alipay handoffs are both
 * dead in there, so the same overlay covers both: it appears at payment and again at
 * delivery, and it carries the auth handoff token in the link so the browser lands signed
 * in and on the same step. Never a toast, never dismissible into nothing — the user cannot
 * finish the task inside WeChat, so the overlay owns the screen until they leave or cancel.
 */
function WeChatEscape({
  open,
  reason = "download",
  url,
  tokenMinutes = 30,
  onCopy,
  onDismiss,
  style
}) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);
  if (!open) return null;
  const copy = () => {
    if (url && typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    if (onCopy) onCopy(url);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": __ds_scope.t("wechat.title"),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 80,
      display: "grid",
      alignItems: "start",
      background: "rgba(11,37,69,.82)",
      padding: "var(--space-4)",
      overflowY: "auto",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      top: 10,
      right: 18,
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "var(--white)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-14)",
      opacity: .85,
      letterSpacing: ".2em"
    }
  }, "\xB7\xB7\xB7"), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-right",
    size: 26,
    style: {
      transform: "rotate(-40deg)",
      opacity: .85
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 72,
      marginInline: "auto",
      width: "min(420px,100%)",
      background: "var(--white)",
      borderRadius: "var(--radius-card)",
      boxShadow: "var(--shadow-3)",
      padding: "var(--space-5)",
      display: "grid",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      width: 36,
      height: 36,
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      background: "var(--surface-teal-soft)",
      color: "var(--teal-600)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "message-square",
    size: 19
  })), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--fs-20)",
      lineHeight: 1.45,
      color: "var(--text-heading)"
    }
  }, __ds_scope.t("wechat.title"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-16)",
      lineHeight: 1.8,
      color: "var(--text-body)"
    }
  }, __ds_scope.t(BODY[reason] || BODY.download)), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)"
    }
  }, __ds_scope.t("wechat.hint")), url ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-3)",
      background: "var(--ink-50)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-num)",
      fontSize: "var(--fs-12)",
      color: "var(--text-muted)",
      wordBreak: "break-all",
      lineHeight: 1.6
    }
  }, url), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: copy,
    style: {
      minHeight: "var(--touch-min)",
      padding: "0 var(--space-4)",
      background: "var(--white)",
      border: "1px solid var(--action-secondary-border)",
      borderRadius: "var(--radius-control)",
      color: "var(--action-secondary-fg)",
      fontSize: "var(--fs-16)",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: copied ? "check" : "link",
    size: 16
  }), copied ? __ds_scope.t("common.copied") : __ds_scope.t("common.copy")), /*#__PURE__*/React.createElement("p", {
    style: {
      display: "flex",
      gap: 6,
      fontSize: "var(--fs-12)",
      lineHeight: 1.7,
      color: "var(--text-faint)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "lock",
    size: 13,
    style: {
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("span", null, __ds_scope.t("wechat.tokenNote", {
    minutes: tokenMinutes
  })))) : null, onDismiss ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    style: {
      minHeight: 40,
      background: "transparent",
      border: 0,
      color: "var(--text-muted)",
      fontSize: "var(--fs-14)",
      cursor: "pointer"
    }
  }, __ds_scope.t("wechat.dismiss")) : null));
}
Object.assign(__ds_scope, { isWeChat, WeChatEscape });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/WeChatEscape.jsx", error: String((e && e.message) || e) }); }

// components/forms/ChoiceRow.jsx
try { (() => {
function ChoiceRow({
  type,
  name,
  checked,
  onChange,
  title,
  hint,
  value
}) {
  const id = React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "flex-start",
      minHeight: "var(--touch-min)",
      padding: "var(--space-4)",
      background: checked ? "var(--surface-selected)" : "var(--white)",
      border: `${checked ? 2 : 1}px solid ${checked ? "var(--blue-600)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-control)",
      cursor: "pointer",
      transition: "var(--transition-control)"
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    type: type,
    name: name,
    value: value,
    checked: checked,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none",
      width: 24,
      height: 24,
      marginTop: 1,
      borderRadius: type === "radio" ? "50%" : "var(--radius-xs)",
      border: `2px solid ${checked ? "var(--blue-600)" : "var(--border-strong)"}`,
      background: checked ? "var(--blue-600)" : "var(--white)"
    }
  }, checked ? type === "radio" ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--white)"
    }
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 16,
    style: {
      color: "var(--white)"
    }
  }) : null), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--fs-16)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-heading)",
      lineHeight: 1.5
    }
  }, title), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginTop: 2,
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)",
      lineHeight: 1.6
    }
  }, hint) : null));
}
Object.assign(__ds_scope, { ChoiceRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ChoiceRow.jsx", error: String((e && e.message) || e) }); }

// components/forms/CheckboxGroup.jsx
try { (() => {
/** Same row shape as RadioGroup so a page never changes rhythm between question types. */
function CheckboxGroup({
  name,
  options = [],
  value = [],
  onChange,
  columns = 1
}) {
  const toggle = v => onChange && onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`,
      gap: "var(--space-3)"
    }
  }, options.map(o => /*#__PURE__*/React.createElement(__ds_scope.ChoiceRow, {
    key: o.value,
    type: "checkbox",
    name: name,
    value: o.value,
    title: o.title,
    hint: o.hint,
    checked: value.includes(o.value),
    onChange: () => toggle(o.value)
  })));
}
Object.assign(__ds_scope, { CheckboxGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/CheckboxGroup.jsx", error: String((e && e.message) || e) }); }

// components/forms/DateInput.jsx
try { (() => {
/** Three separate number fields in 年 / 月 / 日 order. Never a date-picker overlay on mobile. */
function DateInput({
  label,
  hint,
  error,
  value = {},
  onChange
}) {
  const set = k => e => onChange && onChange({
    ...value,
    [k]: e.target.value
  });
  const field = (k, w, ph, unit) => /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-1)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)"
    }
  }, unit), /*#__PURE__*/React.createElement("input", {
    inputMode: "numeric",
    placeholder: ph,
    value: value[k] || "",
    onChange: set(k),
    style: {
      width: w,
      minHeight: "var(--control-h)",
      padding: "var(--space-3)",
      fontSize: "var(--type-input-size)",
      fontFamily: "var(--font-num)",
      textAlign: "center",
      color: "var(--text-body)",
      background: "var(--white)",
      border: `${error ? 2 : 1}px solid ${error ? "var(--red-500)" : "var(--border-input)"}`,
      borderRadius: "var(--radius-control)",
      boxShadow: "var(--shadow-inset-input)"
    }
  }));
  return /*#__PURE__*/React.createElement("div", null, label ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "var(--space-2)",
      fontSize: "var(--type-label-size)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-heading)"
    }
  }, label) : null, hint ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "var(--space-3)",
      fontSize: "var(--type-hint-size)",
      color: "var(--text-muted)"
    }
  }, hint) : null, error ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "var(--space-3)",
      fontSize: "var(--fs-14)",
      fontWeight: "var(--fw-medium)",
      color: "var(--status-error-fg)"
    }
  }, error) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)"
    }
  }, field("year", 96, "2026", __ds_scope.t("date.year")), field("month", 72, "08", __ds_scope.t("date.month")), field("day", 72, "09", __ds_scope.t("date.day"))));
}
Object.assign(__ds_scope, { DateInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/DateInput.jsx", error: String((e && e.message) || e) }); }

// components/forms/ErrorSummary.jsx
try { (() => {
/**
 * Sits at the very top of a page that failed validation, is focused on render,
 * and links to each field. Every message says what to DO, not what went wrong.
 */
function ErrorSummary({
  title,
  errors = [],
  onJump
}) {
  const heading = title !== undefined ? title : __ds_scope.t("errorSummary.title");
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);
  if (!errors.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    tabIndex: -1,
    role: "alert",
    style: {
      padding: "var(--space-4) var(--space-5)",
      marginBottom: "var(--space-6)",
      background: "var(--status-error-bg)",
      border: "1px solid var(--status-error-border)",
      borderLeft: "4px solid var(--red-500)",
      borderRadius: "0 var(--radius-card) var(--radius-card) 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      color: "var(--status-error-fg)",
      fontSize: "var(--fs-18)",
      fontWeight: "var(--fw-semibold)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "circle-alert",
    size: 20
  }), heading), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: "var(--space-3) 0 0",
      padding: 0,
      listStyle: "none",
      display: "grid",
      gap: "var(--space-2)"
    }
  }, errors.map(e => /*#__PURE__*/React.createElement("li", {
    key: e.field
  }, /*#__PURE__*/React.createElement("a", {
    href: `#${e.field}`,
    onClick: ev => {
      if (onJump) {
        ev.preventDefault();
        onJump(e.field);
      }
    },
    style: {
      color: "var(--status-error-fg)",
      fontSize: "var(--fs-16)",
      textDecorationThickness: 1
    }
  }, e.message)))));
}
Object.assign(__ds_scope, { ErrorSummary });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/ErrorSummary.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const base = (invalid, focus) => ({
  width: "100%",
  minHeight: "var(--control-h)",
  padding: "var(--space-3) var(--space-4)",
  fontSize: "var(--type-input-size)",
  lineHeight: 1.5,
  fontFamily: "var(--font-sans)",
  color: "var(--text-body)",
  background: "var(--white)",
  border: `${invalid ? 2 : 1}px solid ${invalid ? "var(--red-500)" : focus ? "var(--blue-600)" : "var(--border-input)"}`,
  borderRadius: "var(--radius-control)",
  boxShadow: "var(--shadow-inset-input)",
  outline: focus ? "3px solid var(--focus-ring)" : "none",
  outlineOffset: 2,
  transition: "var(--transition-control)"
});

/** Text field. 16px minimum so iOS Safari never zooms on focus. */
function Input({
  label,
  hint,
  error,
  prefix,
  suffix,
  width = "full",
  id,
  ...rest
}) {
  const auto = React.useId();
  const inputId = id || auto;
  const [focus, setFocus] = React.useState(false);
  const widths = {
    full: "100%",
    lg: "24em",
    md: "16em",
    sm: "10em",
    xs: "6em"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: widths[width] || width
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: "block",
      marginBottom: "var(--space-2)",
      fontSize: "var(--type-label-size)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-heading)"
    }
  }, label) : null, hint ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "var(--space-2)",
      fontSize: "var(--type-hint-size)",
      color: "var(--text-muted)"
    }
  }, hint) : null, error ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "var(--space-2)",
      fontSize: "var(--fs-14)",
      fontWeight: "var(--fw-medium)",
      color: "var(--status-error-fg)"
    }
  }, error) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "stretch"
    }
  }, prefix ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      padding: "0 var(--space-3)",
      background: "var(--ink-100)",
      border: "1px solid var(--border-input)",
      borderRight: 0,
      borderRadius: "var(--radius-control) 0 0 var(--radius-control)",
      color: "var(--text-muted)",
      fontSize: "var(--fs-14)"
    }
  }, prefix) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...base(!!error, focus),
      borderRadius: prefix ? "0 var(--radius-control) var(--radius-control) 0" : "var(--radius-control)"
    }
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      paddingLeft: "var(--space-2)",
      color: "var(--text-muted)",
      fontSize: "var(--fs-14)"
    }
  }, suffix) : null));
}

/** Multi-line field. Rows are generous; CJK paragraphs run long. */
function Textarea({
  label,
  hint,
  error,
  rows = 5,
  id,
  ...rest
}) {
  const auto = React.useId();
  const inputId = id || auto;
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", null, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: "block",
      marginBottom: "var(--space-2)",
      fontSize: "var(--type-label-size)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-heading)"
    }
  }, label) : null, hint ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "var(--space-2)",
      fontSize: "var(--type-hint-size)",
      color: "var(--text-muted)"
    }
  }, hint) : null, /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    rows: rows,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...base(!!error, focus),
      lineHeight: "var(--lh-body)",
      resize: "vertical"
    }
  }, rest)));
}
Object.assign(__ds_scope, { Input, Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Question.jsx
try { (() => {
/**
 * One question per page. The question IS the page heading; the explanation sits
 * inline beneath it (never a tooltip — hover does not exist on touch).
 */
function Question({
  question,
  hint,
  error,
  children,
  as = "h1",
  legend,
  footnote,
  style
}) {
  const H = as;
  const id = React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--measure-question)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(H, {
    style: {
      fontSize: "var(--type-question-size)",
      lineHeight: "var(--type-question-lh)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-heading)",
      margin: 0
    }
  }, question), hint ? /*#__PURE__*/React.createElement("p", {
    id: `${id}-hint`,
    style: {
      marginTop: "var(--space-2)",
      fontSize: "var(--type-hint-size)",
      lineHeight: "var(--type-hint-lh)",
      color: "var(--text-muted)"
    }
  }, hint) : null, legend ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-2)",
      fontSize: "var(--fs-14)",
      color: "var(--text-faint)"
    }
  }, legend) : null, error ? /*#__PURE__*/React.createElement("p", {
    role: "alert",
    style: {
      display: "flex",
      gap: "var(--space-2)",
      marginTop: "var(--space-3)",
      paddingLeft: "var(--space-3)",
      borderLeft: "4px solid var(--red-500)",
      color: "var(--status-error-fg)",
      fontSize: "var(--fs-16)",
      fontWeight: "var(--fw-medium)"
    }
  }, error) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)"
    }
  }, children), footnote ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-5)",
      fontSize: "var(--fs-14)",
      color: "var(--text-faint)",
      lineHeight: 1.6
    }
  }, footnote) : null);
}
Object.assign(__ds_scope, { Question });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Question.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioGroup.jsx
try { (() => {
/** Full-width tappable rows, GOV.UK style. Each option may carry its own inline explanation. */
function RadioGroup({
  name,
  options = [],
  value,
  onChange,
  columns = 1
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`,
      gap: "var(--space-3)"
    }
  }, options.map(o => /*#__PURE__*/React.createElement(__ds_scope.ChoiceRow, {
    key: o.value,
    type: "radio",
    name: name,
    value: o.value,
    title: o.title,
    hint: o.hint,
    checked: value === o.value,
    onChange: () => onChange && onChange(o.value)
  })));
}
Object.assign(__ds_scope, { RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioGroup.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Always the native <select>. On touch this opens the OS picker, which is faster,
 * accessible and familiar; we never ship a custom listbox.
 */
function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  id,
  width = "full",
  ...rest
}) {
  const auto = React.useId();
  const selId = id || auto;
  const [focus, setFocus] = React.useState(false);
  const widths = {
    full: "100%",
    lg: "24em",
    md: "16em",
    sm: "10em"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: widths[width] || width
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: selId,
    style: {
      display: "block",
      marginBottom: "var(--space-2)",
      fontSize: "var(--type-label-size)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-heading)"
    }
  }, label) : null, hint ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "var(--space-2)",
      fontSize: "var(--type-hint-size)",
      color: "var(--text-muted)"
    }
  }, hint) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      minHeight: "var(--control-h)",
      padding: "var(--space-3) var(--space-10) var(--space-3) var(--space-4)",
      fontSize: "var(--type-input-size)",
      fontFamily: "var(--font-sans)",
      color: "var(--text-body)",
      background: "var(--white)",
      appearance: "none",
      border: `${error ? 2 : 1}px solid ${error ? "var(--red-500)" : focus ? "var(--blue-600)" : "var(--border-input)"}`,
      borderRadius: "var(--radius-control)",
      outline: focus ? "3px solid var(--focus-ring)" : "none",
      outlineOffset: 2
    }
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder) : null, options.map(o => typeof o === "string" ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 20,
    style: {
      position: "absolute",
      right: "var(--space-4)",
      top: "50%",
      transform: "translateY(-50%)",
      color: "var(--text-muted)",
      pointerEvents: "none"
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BackLink.jsx
try { (() => {
/** Text back link above the question. Answers are saved before it navigates. */
function BackLink({
  children,
  onClick,
  href = "#"
}) {
  const label = children !== undefined ? children : __ds_scope.t("nav.back");
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-1)",
      minHeight: "var(--touch-min)",
      fontSize: "var(--fs-16)",
      color: "var(--text-link)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-left",
    size: 18
  }), label);
}
Object.assign(__ds_scope, { BackLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BackLink.jsx", error: String((e && e.message) || e) }); }

// components/navigation/LanguageSwitcher.jsx
try { (() => {
/* Each language names itself, in its own script, in every locale — so the names come from
   languages.js, not the catalogue. The note beneath is the reason this component exists:
   switching the interface language does NOT change the language of the delivered pack,
   which the destination consulate decides. Users assume otherwise, so it is permanent copy
   ("language.note"), never a tooltip. */
const LANGS = [{
  code: "zh-CN",
  name: __ds_scope.languageName("zh-CN")
}, {
  code: "en",
  name: __ds_scope.languageName("en")
}];

/** Interface-language switcher. Each language names itself, in its own language — never a flag. */
function LanguageSwitcher({
  value = "zh-CN",
  onChange,
  languages = LANGS,
  placement = "header",
  note,
  tone = placement === "footer" ? "inverse" : "default",
  style
}) {
  const inverse = tone === "inverse";
  const stacked = placement !== "header";
  const noteText = note !== undefined ? note : __ds_scope.t("language.note");
  const muted = inverse ? "var(--blue-300)" : "var(--text-muted)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: stacked ? "column" : "row",
      flexWrap: "wrap",
      alignItems: stacked ? "stretch" : "center",
      gap: stacked ? "var(--space-2)" : "var(--space-3)",
      minInlineSize: 0,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": __ds_scope.t("language.groupLabel"),
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 2,
      padding: 2,
      background: inverse ? "rgba(255,255,255,.08)" : "var(--ink-50)",
      border: `1px solid ${inverse ? "var(--blue-800)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-pill)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "languages",
    size: 16,
    style: {
      color: muted,
      marginInline: "6px 2px"
    }
  }), languages.map(l => {
    const on = l.code === value;
    return /*#__PURE__*/React.createElement("button", {
      key: l.code,
      type: "button",
      lang: l.code,
      "aria-pressed": on,
      onClick: () => onChange && onChange(l.code),
      style: {
        minHeight: stacked ? "var(--touch-min)" : 34,
        paddingInline: "var(--space-4)",
        border: 0,
        borderRadius: "var(--radius-pill)",
        background: on ? inverse ? "var(--white)" : "var(--action-primary)" : "transparent",
        color: on ? inverse ? "var(--blue-900)" : "var(--white)" : inverse ? "var(--blue-100)" : "var(--text-body)",
        fontSize: "var(--fs-14)",
        fontWeight: on ? "var(--fw-medium)" : "var(--fw-regular)",
        cursor: "pointer",
        transition: "var(--transition-control)",
        whiteSpace: "normal",
        textAlign: "center"
      }
    }, l.name);
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--fs-12)",
      lineHeight: 1.6,
      color: muted,
      maxInlineSize: stacked ? "none" : "26em",
      textWrap: "pretty"
    }
  }, noteText));
}
Object.assign(__ds_scope, { LanguageSwitcher });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/LanguageSwitcher.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PipelineProgress.jsx
try { (() => {
/* The pipeline is always these four stages, in this order. Not configurable: the sequence
   is what the service does, and a user who comes back an hour later has to find the same
   four rows in the same places. */
const PIPELINE_STAGES = ["sources", "generate", "consistency", "review"];
const STAGE_KEY = {
  sources: "pipeline.stage.sources",
  generate: "pipeline.stage.generate",
  consistency: "pipeline.stage.consistency",
  review: "pipeline.stage.review"
};
const STATE = {
  done: {
    key: "pipeline.state.done",
    icon: "circle-check",
    fg: "var(--green-600)",
    bg: "var(--green-50)"
  },
  active: {
    key: "pipeline.state.active",
    icon: "loader-circle",
    fg: "var(--blue-600)",
    bg: "var(--surface-selected)"
  },
  pending: {
    key: "pipeline.state.pending",
    icon: "circle-dashed",
    fg: "var(--text-faint)",
    bg: "var(--ink-100)"
  },
  blocked: {
    key: "pipeline.state.blocked",
    icon: "triangle-alert",
    fg: "var(--amber-600)",
    bg: "var(--amber-50)"
  }
};

/**
 * Progress of the asynchronous pack pipeline. Distinct from StepProgress, which is
 * intake-shaped (section / step / total, one screen at a time, driven by the user).
 * This is machine work the user waits on: minutes to hours, four named stages, and the
 * page can be closed and reopened at any point — so it states that closing is safe and
 * always renders every stage, including the ones not started.
 */
function PipelineProgress({
  current = 0,
  states = {},
  notes = {},
  etaMinutes,
  leaveNote = true,
  title = true,
  style
}) {
  const stateOf = (name, i) => states[name] || (i < current ? "done" : i === current ? "active" : "pending");
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: "var(--space-5)",
      background: "var(--white)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      display: "grid",
      gap: "var(--space-4)",
      ...style
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--fs-18)",
      lineHeight: 1.5,
      color: "var(--text-heading)"
    }
  }, __ds_scope.t("pipeline.title")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-14)",
      fontFamily: "var(--font-num)",
      color: "var(--text-muted)"
    }
  }, __ds_scope.t("pipeline.stageOf", {
    n: Math.min(current + 1, PIPELINE_STAGES.length),
    total: PIPELINE_STAGES.length
  }))) : null, /*#__PURE__*/React.createElement("ol", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: 0
    }
  }, PIPELINE_STAGES.map((name, i) => {
    const s = STATE[stateOf(name, i)] || STATE.pending;
    const last = i === PIPELINE_STAGES.length - 1;
    return /*#__PURE__*/React.createElement("li", {
      key: name,
      style: {
        display: "flex",
        gap: "var(--space-3)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: "none",
        display: "grid",
        justifyItems: "center",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        background: s.bg,
        color: s.fg
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: s.icon,
      size: 16
    })), !last ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        minHeight: 22,
        background: "var(--border-subtle)",
        borderRadius: 1
      }
    }) : null), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        paddingBottom: last ? 0 : "var(--space-4)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        flexWrap: "wrap",
        minHeight: 30
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-16)",
        fontWeight: "var(--fw-medium)",
        color: s === STATE.pending ? "var(--text-muted)" : "var(--text-heading)"
      }
    }, __ds_scope.t(STAGE_KEY[name])), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-12)",
        color: s.fg
      }
    }, __ds_scope.t(s.key))), notes[name] ? /*#__PURE__*/React.createElement("p", {
      style: {
        marginTop: 2,
        fontSize: "var(--fs-14)",
        lineHeight: 1.75,
        color: "var(--text-muted)",
        maxWidth: "var(--measure-prose)"
      }
    }, notes[name]) : null));
  })), etaMinutes != null ? /*#__PURE__*/React.createElement("p", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 15,
    style: {
      color: "var(--text-faint)"
    }
  }), __ds_scope.t("pipeline.eta", {
    minutes: etaMinutes
  })) : null, leaveNote ? /*#__PURE__*/React.createElement("p", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      padding: "var(--space-3) var(--space-4)",
      background: "var(--surface-teal-soft)",
      border: "1px solid var(--teal-100)",
      borderRadius: "var(--radius-sm)",
      fontSize: "var(--fs-14)",
      lineHeight: 1.75,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "cloud-check",
    size: 16,
    style: {
      marginTop: 3,
      color: "var(--teal-600)"
    }
  }), /*#__PURE__*/React.createElement("span", null, __ds_scope.t("pipeline.leaveNote"))) : null);
}
Object.assign(__ds_scope, { PIPELINE_STAGES, PipelineProgress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PipelineProgress.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteHeader.jsx
try { (() => {
/** Wordmark set in the system stack — Visa Master has no supplied logo file. */
function Wordmark({
  size = 20,
  tone = "default"
}) {
  const fg = tone === "inverse" ? "var(--white)" : "var(--blue-900)";
  const accent = tone === "inverse" ? "var(--teal-300)" : "var(--teal-600)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "baseline",
      gap: 6,
      fontSize: size,
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-cjk-display)",
      color: fg,
      whiteSpace: "nowrap"
    }
  }, "\u7B7E\u8BC1\u5927\u5E08", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: size * 0.62,
      fontWeight: "var(--fw-medium)",
      color: accent,
      letterSpacing: "var(--ls-latin-caps)"
    }
  }, "VISA MASTER"), " ");
}

/** Marketing + app header. Nav collapses to a menu button below 900px (pass `compact`).
    `language` is a <LanguageSwitcher> — rendered in the desktop nav only; on compact it belongs
    inside the collapsed nav, so it never takes a top-level mobile nav slot. */
function SiteHeader({
  nav = [],
  action,
  language,
  compact,
  onMenu,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-5)",
      flexWrap: "wrap",
      minHeight: 64,
      paddingBlock: compact ? 0 : "var(--space-2)",
      paddingInline: compact ? "var(--gutter-mobile)" : "var(--gutter-desktop)",
      background: "var(--white)",
      borderBottom: "1px solid var(--border-subtle)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(Wordmark, {
    size: compact ? 17 : 20
  }), compact ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": __ds_scope.t("nav.menu"),
    onClick: onMenu,
    style: {
      width: 44,
      height: 44,
      display: "grid",
      placeItems: "center",
      background: "transparent",
      border: 0,
      color: "var(--text-heading)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "menu",
    size: 22
  })) : /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "var(--space-5)"
    }
  }, nav.map(n => /*#__PURE__*/React.createElement("a", {
    key: n.label,
    href: n.href || "#",
    style: {
      fontSize: "var(--fs-16)",
      color: "var(--text-body)",
      textDecoration: "none"
    }
  }, n.label)), language, action));
}
Object.assign(__ds_scope, { Wordmark, SiteHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SiteFooter.jsx
try { (() => {
/** Deep navy footer. Carries the regulatory line and the record number mainland sites require. */
function SiteFooter({
  columns = [],
  note,
  record,
  language
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--surface-inverse)",
      color: "var(--blue-100)",
      padding: "var(--space-12) var(--gutter-desktop) var(--space-8)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Wordmark, {
    tone: "inverse"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
      gap: "var(--space-8)",
      marginTop: "var(--space-8)"
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-14)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--white)",
      marginBottom: "var(--space-3)"
    }
  }, c.title), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: "var(--space-2)"
    }
  }, c.links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: "var(--fs-14)",
      color: "var(--blue-200)",
      textDecoration: "none"
    }
  }, l))))))), language ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)"
    }
  }, language) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-8)",
      paddingTop: "var(--space-5)",
      borderTop: "1px solid var(--blue-800)",
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-4)",
      justifyContent: "space-between",
      fontSize: "var(--fs-12)",
      color: "var(--blue-300)",
      lineHeight: 1.8
    }
  }, /*#__PURE__*/React.createElement("span", null, note), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)"
    }
  }, record))));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StepProgress.jsx
try { (() => {
/** Visible progress for a long intake: section name, step count, and a thin bar. */
function StepProgress({
  section,
  step,
  total,
  sections = [],
  style
}) {
  const pct = Math.round(step / total * 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      marginBottom: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-14)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-heading)"
    }
  }, section), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-14)",
      fontFamily: "var(--font-num)",
      color: "var(--text-muted)"
    }
  }, __ds_scope.t("progress.stepOfTotal", {
    step,
    total
  }))), /*#__PURE__*/React.createElement("div", {
    role: "progressbar",
    "aria-valuenow": pct,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    style: {
      height: 6,
      background: "var(--ink-200)",
      borderRadius: "var(--radius-pill)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: "100%",
      background: "var(--teal-500)",
      borderRadius: "var(--radius-pill)",
      transition: `width var(--dur-slow) var(--ease-out)`
    }
  })), sections.length ? /*#__PURE__*/React.createElement("ol", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-1) var(--space-4)",
      listStyle: "none",
      margin: "var(--space-3) 0 0",
      padding: 0
    }
  }, sections.map(s => /*#__PURE__*/React.createElement("li", {
    key: s.name,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      fontSize: "var(--fs-14)",
      color: s.state === "current" ? "var(--text-heading)" : s.state === "done" ? "var(--text-muted)" : "var(--text-faint)",
      fontWeight: s.state === "current" ? "var(--fw-semibold)" : "var(--fw-regular)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: s.state === "done" ? "var(--teal-500)" : s.state === "current" ? "var(--blue-600)" : "var(--ink-300)"
    }
  }), s.name))) : null);
}
Object.assign(__ds_scope, { StepProgress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StepProgress.jsx", error: String((e && e.message) || e) }); }

// components/navigation/StickyActionBar.jsx
try { (() => {
/**
 * The single sticky action bar. One per view. It survives the on-screen keyboard
 * and respects the home-indicator inset.
 */
function StickyActionBar({
  children,
  secondary,
  note,
  sticky = true,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: sticky ? "sticky" : "static",
      bottom: 0,
      zIndex: 20,
      padding: `var(--space-3) var(--gutter-mobile) calc(var(--space-3) + var(--safe-bottom))`,
      background: "var(--white)",
      borderTop: "1px solid var(--border-subtle)",
      boxShadow: "0 -4px 16px rgba(11,37,69,.05)",
      ...style
    }
  }, note ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "var(--space-2)",
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)",
      textAlign: "center"
    }
  }, note) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "center",
      maxWidth: "var(--container-narrow)",
      margin: "0 auto"
    }
  }, secondary ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "none"
    }
  }, secondary) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, children)));
}
Object.assign(__ds_scope, { StickyActionBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/StickyActionBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TaskList.jsx
try { (() => {
const STATE = {
  done: {
    key: "tasklist.state.done",
    tone: "success"
  },
  progress: {
    key: "tasklist.state.progress",
    tone: "info"
  },
  todo: {
    key: "tasklist.state.todo",
    tone: "neutral"
  },
  locked: {
    key: "tasklist.state.locked",
    tone: "neutral"
  },
  problem: {
    key: "tasklist.state.problem",
    tone: "warning"
  }
};

/**
 * The intake hub, GOV.UK task-list shaped: every section listed with its state, jump in
 * anywhere, come back to the same page. It is what makes 25 screens feel like nine
 * sections you are working through rather than a queue with no end. Always the whole list —
 * hiding future sections is what makes a long form feel endless.
 *
 * A locked section states what unlocks it. It is never simply greyed out and silent.
 */
function TaskList({
  sections = [],
  onSelect,
  summary = true,
  style
}) {
  const items = sections.flatMap(s => s.items || []);
  const done = items.filter(i => i.state === "done").length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-5)",
      ...style
    }
  }, summary && items.length ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-16)",
      color: "var(--text-body)"
    }
  }, __ds_scope.t("tasklist.summary", {
    done,
    total: items.length
  })) : null, sections.map((section, si) => /*#__PURE__*/React.createElement("section", {
    key: section.id
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: "var(--space-4)",
      marginBottom: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--fs-18)",
      lineHeight: 1.5,
      color: "var(--text-heading)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-num)",
      color: "var(--text-faint)",
      marginInlineEnd: "var(--space-2)"
    }
  }, si + 1), section.title), section.items && section.items.length ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-12)",
      fontFamily: "var(--font-num)",
      color: "var(--text-faint)"
    }
  }, __ds_scope.t("tasklist.itemsDone", {
    done: section.items.filter(i => i.state === "done").length,
    total: section.items.length
  })) : null), section.description ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: "var(--space-2)",
      fontSize: "var(--fs-14)",
      lineHeight: 1.75,
      color: "var(--text-muted)",
      maxWidth: "var(--measure-prose)"
    }
  }, section.description) : null, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      borderTop: "1px solid var(--border-subtle)"
    }
  }, (section.items || []).map(item => {
    const s = STATE[item.state] || STATE.todo;
    const locked = item.state === "locked";
    return /*#__PURE__*/React.createElement("li", {
      key: item.id,
      style: {
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: locked,
      "aria-disabled": locked || undefined,
      onClick: () => !locked && onSelect && onSelect(item, section),
      style: {
        width: "100%",
        minHeight: "var(--touch-min)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-2)",
        textAlign: "start",
        background: "transparent",
        border: 0,
        cursor: locked ? "default" : "pointer",
        font: "inherit",
        color: "inherit"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "grid",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-16)",
        color: locked ? "var(--text-faint)" : "var(--action-link)",
        textDecoration: locked ? "none" : "underline",
        textUnderlineOffset: 3,
        textDecorationThickness: 1
      }
    }, item.title), locked && item.after ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-12)",
        color: "var(--text-faint)",
        lineHeight: 1.7
      }
    }, __ds_scope.t("tasklist.lockedHint", {
      section: item.after
    })) : null, !locked && item.hint ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-12)",
        color: "var(--text-faint)",
        lineHeight: 1.7
      }
    }, item.hint) : null), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      size: "sm",
      tone: s.tone
    }, __ds_scope.t(s.key)), !locked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "chevron-right",
      size: 16,
      style: {
        color: "var(--text-faint)"
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        width: 16
      }
    })));
  })))));
}
Object.assign(__ds_scope, { TaskList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TaskList.jsx", error: String((e && e.message) || e) }); }

// components/pack/CameraCaptureLoop.jsx
try { (() => {
/**
 * Multi-page capture loop: shoot, keep, shoot the next page. Thumbnails stay on
 * screen and can be reordered, because page order is what the consulate reads.
 */
function CameraCaptureLoop({
  pages = [],
  onCapture,
  onRemove,
  onMove,
  guide,
  label,
  style
}) {
  const guideText = guide !== undefined ? guide : __ds_scope.t("camera.guide");
  const pageLabel = n => label !== undefined ? String(label).replace("{n}", n) : __ds_scope.t("camera.page", {
    n
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "3 / 4",
      maxHeight: 320,
      borderRadius: "var(--radius-card)",
      background: "var(--ink-900)",
      overflow: "hidden",
      display: "grid",
      placeItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: "10% 8%",
      border: "2px solid rgba(255,255,255,.55)",
      borderRadius: "var(--radius-sm)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "var(--space-3)",
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: "var(--fs-12)",
      color: "rgba(255,255,255,.85)"
    }
  }, guideText), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": __ds_scope.t("camera.capture"),
    onClick: onCapture,
    style: {
      position: "absolute",
      bottom: "var(--space-4)",
      width: 60,
      height: 60,
      borderRadius: "50%",
      border: "4px solid rgba(255,255,255,.9)",
      background: "var(--white)",
      cursor: "pointer"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "var(--space-4) 0 var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-14)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-heading)"
    }
  }, __ds_scope.t("camera.captured", {
    n: pages.length
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)"
    }
  }, __ds_scope.t("camera.reorderHint"))), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      gap: "var(--space-3)",
      overflowX: "auto"
    }
  }, pages.map((p, i) => /*#__PURE__*/React.createElement("li", {
    key: p.id,
    style: {
      flex: "none",
      width: 84
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      aspectRatio: "3 / 4",
      background: p.thumb || "var(--ink-100)",
      backgroundSize: "cover",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 4,
      top: 4,
      padding: "1px 6px",
      borderRadius: "var(--radius-chip)",
      background: "rgba(11,37,69,.72)",
      color: "var(--white)",
      fontSize: "var(--fs-12)",
      fontFamily: "var(--font-num)"
    }
  }, i + 1), onRemove ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": __ds_scope.t("camera.deletePage", {
      n: i + 1
    }),
    onClick: () => onRemove(p.id),
    style: {
      position: "absolute",
      right: 2,
      top: 2,
      width: 22,
      height: 22,
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      border: 0,
      background: "rgba(11,37,69,.72)",
      color: "var(--white)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 12
  })) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: 2,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": __ds_scope.t("camera.moveEarlier"),
    onClick: () => onMove && onMove(i, -1),
    style: {
      width: 30,
      height: 26,
      border: "1px solid var(--border-subtle)",
      background: "var(--white)",
      borderRadius: "var(--radius-xs)",
      color: "var(--text-muted)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-left",
    size: 13
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": __ds_scope.t("camera.moveLater"),
    onClick: () => onMove && onMove(i, 1),
    style: {
      width: 30,
      height: 26,
      border: "1px solid var(--border-subtle)",
      background: "var(--white)",
      borderRadius: "var(--radius-xs)",
      color: "var(--text-muted)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 13
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)",
      marginTop: 2
    }
  }, pageLabel(i + 1))))));
}
Object.assign(__ds_scope, { CameraCaptureLoop });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pack/CameraCaptureLoop.jsx", error: String((e && e.message) || e) }); }

// components/pack/CitationPanel.jsx
try { (() => {
/**
 * Where a requirement came from, and what we are not promising. Every generated
 * claim in the pack carries one of these; the caveat is never hidden behind a link.
 */
function CitationPanel({
  sources = [],
  caveats = [],
  checkedAt,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-card)",
      background: "var(--white)",
      overflow: "hidden",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-3) var(--space-4)",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--surface-accent-soft)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "book-open-text",
    size: 16,
    style: {
      color: "var(--blue-700)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-14)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--blue-800)"
    }
  }, __ds_scope.t("citations.title")), checkedAt ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontSize: "var(--fs-12)",
      color: "var(--text-muted)",
      fontFamily: "var(--font-num)"
    }
  }, __ds_scope.t("citations.checkedAt", {
    date: checkedAt
  })) : null), /*#__PURE__*/React.createElement("ol", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: "var(--space-2) var(--space-4)",
      display: "grid",
      gap: "var(--space-3)"
    }
  }, sources.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: s.url || s.title,
    style: {
      display: "flex",
      gap: "var(--space-3)",
      paddingTop: i ? "var(--space-3)" : 0,
      borderTop: i ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: "none",
      width: 22,
      height: 22,
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      background: "var(--ink-100)",
      fontFamily: "var(--font-num)",
      fontSize: "var(--fs-12)",
      color: "var(--text-muted)"
    }
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: s.url || "#",
    style: {
      fontSize: "var(--fs-14)",
      fontWeight: "var(--fw-medium)"
    }
  }, s.title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)",
      marginTop: 2,
      wordBreak: "break-all"
    }
  }, s.publisher, s.url ? " · " + s.url : ""), s.quote ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      marginTop: "var(--space-2)",
      paddingLeft: "var(--space-3)",
      borderLeft: "3px solid var(--border-default)",
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)",
      lineHeight: 1.7
    }
  }, s.quote) : null)))), caveats.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: "var(--space-3) var(--space-4)",
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--amber-50)",
      display: "grid",
      gap: "var(--space-2)"
    }
  }, caveats.map(c => /*#__PURE__*/React.createElement("li", {
    key: c,
    style: {
      display: "flex",
      gap: "var(--space-2)",
      fontSize: "var(--fs-14)",
      color: "var(--text-body)",
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "info",
    size: 16,
    style: {
      color: "var(--amber-600)",
      marginTop: 4
    }
  }), c))) : null);
}
Object.assign(__ds_scope, { CitationPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pack/CitationPanel.jsx", error: String((e && e.message) || e) }); }

// components/pack/ConsistencyReport.jsx
try { (() => {
const SEV = {
  conflict: {
    fg: "var(--status-error-fg)",
    bg: "var(--status-error-bg)",
    bd: "var(--status-error-border)",
    icon: "git-compare-arrows",
    key: "consistency.conflict"
  },
  check: {
    fg: "var(--status-warning-fg)",
    bg: "var(--status-warning-bg)",
    bd: "var(--status-warning-border)",
    icon: "triangle-alert",
    key: "consistency.check"
  },
  pass: {
    fg: "var(--status-success-fg)",
    bg: "var(--status-success-bg)",
    bd: "var(--status-success-border)",
    icon: "check",
    key: "consistency.pass"
  }
};

/**
 * Consistency check across the pack: the same fact read out of two documents,
 * side by side, with the fix stated as an instruction.
 */
function ConsistencyReport({
  items = [],
  summary,
  onResolve,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-3)",
      ...style
    }
  }, summary ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)"
    }
  }, summary) : null, items.map(it => {
    const s = SEV[it.severity] || SEV.check;
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      style: {
        border: `1px solid ${s.bd}`,
        borderRadius: "var(--radius-card)",
        background: "var(--white)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        padding: "var(--space-3) var(--space-4)",
        background: s.bg,
        color: s.fg,
        fontSize: "var(--fs-14)",
        fontWeight: "var(--fw-semibold)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: s.icon,
      size: 16
    }), it.field, /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontWeight: "var(--fw-regular)"
      }
    }, __ds_scope.t(s.key))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
        gap: "var(--space-3)",
        padding: "var(--space-4)"
      }
    }, it.readings.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.source,
      style: {
        padding: "var(--space-3)",
        background: "var(--ink-50)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--fs-12)",
        color: "var(--text-faint)",
        marginBottom: 4
      }
    }, r.source), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-num)",
        fontSize: "var(--fs-18)",
        color: "var(--text-heading)",
        fontWeight: "var(--fw-medium)"
      }
    }, r.value)))), it.action ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        flexWrap: "wrap",
        padding: "var(--space-3) var(--space-4)",
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--ink-50)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-14)",
        color: "var(--text-body)",
        flex: 1,
        minWidth: 200
      }
    }, it.action), onResolve ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onResolve(it.id),
      style: {
        minHeight: 36,
        padding: "0 var(--space-4)",
        background: "var(--white)",
        border: "1px solid var(--action-secondary-border)",
        borderRadius: "var(--radius-control)",
        color: "var(--action-secondary-fg)",
        fontSize: "var(--fs-14)",
        cursor: "pointer"
      }
    }, __ds_scope.t("consistency.fix")) : null) : null);
  }));
}
Object.assign(__ds_scope, { ConsistencyReport });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pack/ConsistencyReport.jsx", error: String((e && e.message) || e) }); }

// components/pack/FilePreview.jsx
try { (() => {
/**
 * Preview pane for one file in the pack: what it is, why it is in the pack,
 * and what the applicant is supposed to do with the printed copy.
 */
function FilePreview({
  file,
  style
}) {
  if (!file) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "var(--space-4)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-3)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--fs-20)",
      lineHeight: 1.4
    }
  }, file.name), file.badge ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: file.badgeTone || "neutral"
  }, file.badge) : null), file.purpose ? /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "var(--space-2)",
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)",
      lineHeight: 1.75,
      maxWidth: "var(--measure-prose)"
    }
  }, file.purpose) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "1 / 1.414",
      maxHeight: 420,
      background: "var(--white)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
      boxShadow: "var(--shadow-2)",
      padding: "var(--space-6)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12,
      width: "52%",
      background: "var(--ink-200)",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 7,
      width: "34%",
      background: "var(--ink-100)",
      borderRadius: 2,
      marginBottom: 10
    }
  }), [92, 88, 96, 71, 90, 84, 58, 93, 86, 64].map((w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 6,
      width: `${w}%`,
      background: "var(--ink-100)",
      borderRadius: 2
    }
  })))), file.instructions && file.instructions.length ? /*#__PURE__*/React.createElement("ol", {
    style: {
      margin: 0,
      paddingLeft: "1.4em",
      display: "grid",
      gap: "var(--space-2)",
      fontSize: "var(--fs-14)",
      color: "var(--text-body)",
      lineHeight: 1.75
    }
  }, file.instructions.map(s => /*#__PURE__*/React.createElement("li", {
    key: s
  }, s))) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      flexWrap: "wrap",
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "printer",
    size: 14
  }), file.print || __ds_scope.t("file.printA4")), file.pages ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "files",
    size: 14
  }), __ds_scope.t("file.pages", {
    count: file.pages
  })) : null, file.updated ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 14
  }), file.updated) : null));
}
Object.assign(__ds_scope, { FilePreview });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pack/FilePreview.jsx", error: String((e && e.message) || e) }); }

// components/pack/PackFileTree.jsx
try { (() => {
const KIND_ICON = {
  pdf: "file-text",
  doc: "file-pen-line",
  img: "image",
  link: "external-link",
  folder: "folder"
};
const STATUS = {
  ready: {
    tone: "success",
    key: "packStatus.ready"
  },
  review: {
    tone: "info",
    key: "packStatus.review"
  },
  waiting: {
    tone: "warning",
    key: "packStatus.waiting"
  },
  official: {
    tone: "neutral",
    key: "packStatus.official"
  }
};

/* Status accepts the four known states OR an arbitrary { label, tone } — the pack picks up
   destination-specific states (公证中, 已寄出) that this design system cannot enumerate.
   Language is a separate field on purpose: it used to get smuggled in as a status value,
   which is how a file's language became invisible when its status changed. */
function statusOf(status) {
  if (!status) return null;
  if (typeof status === "object") return {
    tone: status.tone || "neutral",
    label: status.label
  };
  const s = STATUS[status];
  return s ? {
    tone: s.tone,
    label: __ds_scope.t(s.key)
  } : null;
}

/** The file's own language, shown in its own script. Never the interface language. */
function LanguageChip({
  language
}) {
  const code = typeof language === "object" ? language.code : language;
  const name = typeof language === "object" && language.name || __ds_scope.languageName(code);
  const label = name || __ds_scope.t("packTree.languageUnknown");
  return /*#__PURE__*/React.createElement("span", {
    title: __ds_scope.t("packTree.languageAria", {
      language: label
    }),
    "aria-label": __ds_scope.t("packTree.languageAria", {
      language: label
    }),
    lang: code || undefined,
    style: {
      flex: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "1px 7px 1px 5px",
      borderRadius: "var(--radius-chip)",
      border: "1px solid var(--border-default)",
      background: "var(--white)",
      fontSize: "var(--fs-12)",
      color: "var(--text-muted)",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "globe",
    size: 12,
    style: {
      color: "var(--text-faint)"
    }
  }), label);
}
function Node({
  node,
  depth,
  openIds,
  toggle,
  selectedId,
  onSelect
}) {
  const isFolder = !!node.children;
  const open = openIds.includes(node.id);
  const selected = selectedId === node.id;
  const status = statusOf(node.status);
  return /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("div", {
    onClick: () => isFolder ? toggle(node.id) : onSelect && onSelect(node),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      minHeight: "var(--touch-min)",
      padding: "var(--space-2) var(--space-3)",
      paddingLeft: `calc(var(--space-3) + ${depth * 18}px)`,
      background: selected ? "var(--surface-selected)" : "transparent",
      borderRadius: "var(--radius-sm)",
      cursor: "pointer",
      color: isFolder ? "var(--text-heading)" : "var(--text-body)",
      fontWeight: isFolder ? "var(--fw-semibold)" : "var(--fw-regular)",
      fontSize: isFolder ? "var(--fs-15,15px)" : "var(--fs-14)"
    }
  }, isFolder ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: open ? "chevron-down" : "chevron-right",
    size: 16,
    style: {
      color: "var(--text-faint)"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: isFolder ? "folder" : KIND_ICON[node.kind] || "file",
    size: 17,
    style: {
      color: isFolder ? "var(--blue-500)" : "var(--text-faint)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, node.name), node.language ? /*#__PURE__*/React.createElement(LanguageChip, {
    language: node.language
  }) : null, node.count != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--fs-12)",
      fontFamily: "var(--font-num)",
      color: "var(--text-faint)"
    }
  }, node.count) : null, status ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    size: "sm",
    tone: status.tone
  }, status.label) : null), isFolder && open ? /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, node.children.map(c => /*#__PURE__*/React.createElement(Node, {
    key: c.id,
    node: c,
    depth: depth + 1,
    openIds: openIds,
    toggle: toggle,
    selectedId: selectedId,
    onSelect: onSelect
  }))) : null);
}

/**
 * The delivered pack, as a tree. Sections are fixed and always in this order:
 * 从这里开始 / 官方文件 / 可编辑模板 / 本人材料 / 来源与提醒.
 *
 * Every file carries its own `language`, set by the destination country, and the tree
 * shows it on the row. The interface language never stands in for it.
 */
function PackFileTree({
  tree = [],
  selectedId,
  onSelect,
  defaultOpen,
  languageNote = true,
  style
}) {
  const [openIds, setOpenIds] = React.useState(defaultOpen || tree.map(t2 => t2.id));
  const toggle = id => setOpenIds(o => o.includes(id) ? o.filter(x => x !== id) : [...o, id]);
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      ...style
    }
  }, languageNote ? /*#__PURE__*/React.createElement("p", {
    style: {
      display: "flex",
      gap: "var(--space-2)",
      margin: "0 0 var(--space-3)",
      padding: "var(--space-2) var(--space-3)",
      background: "var(--ink-50)",
      borderRadius: "var(--radius-sm)",
      fontSize: "var(--fs-12)",
      lineHeight: 1.7,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "globe",
    size: 14,
    style: {
      marginTop: 3,
      color: "var(--text-faint)"
    }
  }), /*#__PURE__*/React.createElement("span", null, __ds_scope.t("packTree.languageNote"))) : null, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: 2
    }
  }, tree.map(n => /*#__PURE__*/React.createElement(Node, {
    key: n.id,
    node: n,
    depth: 0,
    openIds: openIds,
    toggle: toggle,
    selectedId: selectedId,
    onSelect: onSelect
  }))));
}
Object.assign(__ds_scope, { PackFileTree });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pack/PackFileTree.jsx", error: String((e && e.message) || e) }); }

// components/pack/ResumableUploader.jsx
try { (() => {
/**
 * Resumable uploader. Chunked, so a WeChat-browser tab switch does not lose a
 * 40MB bank statement. Desktop accepts multi-file drag-and-drop; touch opens the picker.
 */
function ResumableUploader({
  files = [],
  onPick,
  onRetry,
  hint,
  style
}) {
  const hintText = hint !== undefined ? hint : __ds_scope.t("upload.hint");
  const [over, setOver] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    onDragOver: e => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: e => {
      e.preventDefault();
      setOver(false);
      onPick && onPick();
    },
    onClick: onPick,
    style: {
      display: "grid",
      placeItems: "center",
      gap: "var(--space-2)",
      padding: "var(--space-8) var(--space-5)",
      textAlign: "center",
      background: over ? "var(--surface-selected)" : "var(--white)",
      border: `2px dashed ${over ? "var(--blue-500)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-card)",
      cursor: "pointer",
      transition: "var(--transition-control)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "upload",
    size: 24,
    style: {
      color: "var(--blue-600)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-16)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-heading)"
    }
  }, __ds_scope.t("upload.dropzone")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-14)",
      color: "var(--text-muted)"
    }
  }, hintText), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)"
    }
  }, __ds_scope.t("upload.resumeNote"))), files.length ? /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: "var(--space-4) 0 0",
      padding: 0,
      display: "grid",
      gap: "var(--space-2)"
    }
  }, files.map(f => {
    const failed = f.state === "failed";
    const done = f.progress >= 100;
    return /*#__PURE__*/React.createElement("li", {
      key: f.name,
      style: {
        padding: "var(--space-3) var(--space-4)",
        background: "var(--white)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-card)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: done ? "circle-check" : failed ? "pause" : "arrow-up-from-line",
      size: 18,
      style: {
        color: done ? "var(--green-600)" : failed ? "var(--amber-600)" : "var(--blue-600)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontSize: "var(--fs-14)",
        color: "var(--text-body)"
      }
    }, f.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-num)",
        fontSize: "var(--fs-12)",
        color: "var(--text-faint)"
      }
    }, f.size), failed && onRetry ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onRetry(f.name),
      style: {
        minHeight: 32,
        padding: "0 var(--space-3)",
        background: "transparent",
        border: "1px solid var(--amber-100)",
        borderRadius: "var(--radius-control)",
        color: "var(--amber-600)",
        fontSize: "var(--fs-12)",
        cursor: "pointer"
      }
    }, __ds_scope.t("upload.resume")) : null), !done ? /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "var(--space-2)",
        height: 4,
        background: "var(--ink-200)",
        borderRadius: "var(--radius-pill)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${f.progress || 0}%`,
        height: "100%",
        background: failed ? "var(--amber-500)" : "var(--blue-500)",
        transition: "width var(--dur-base) var(--ease-out)"
      }
    })) : null, failed ? /*#__PURE__*/React.createElement("p", {
      style: {
        marginTop: "var(--space-2)",
        fontSize: "var(--fs-12)",
        color: "var(--amber-600)"
      }
    }, __ds_scope.t("upload.interrupted", {
      progress: f.progress
    })) : null);
  })) : null);
}
Object.assign(__ds_scope, { ResumableUploader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pack/ResumableUploader.jsx", error: String((e && e.message) || e) }); }

// components/pack/TrustRow.jsx
try { (() => {
/** The four-claim trust row under the hero. Separator is a middle dot on wide screens, a stack on narrow. */
function TrustRow({
  items = [],
  tone = "default",
  style
}) {
  const fg = tone === "inverse" ? "var(--blue-100)" : "var(--text-muted)";
  return /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "var(--space-2) var(--space-5)",
      listStyle: "none",
      margin: 0,
      padding: 0,
      ...style
    }
  }, items.map(it => {
    const label = typeof it === "string" ? it : it.label;
    const icon = typeof it === "string" ? "check" : it.icon || "check";
    return /*#__PURE__*/React.createElement("li", {
      key: label,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        fontSize: "var(--fs-14)",
        color: fg,
        lineHeight: 1.6
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: icon,
      size: 16,
      style: {
        color: tone === "inverse" ? "var(--teal-300)" : "var(--teal-600)"
      }
    }), label);
  }));
}
Object.assign(__ds_scope, { TrustRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pack/TrustRow.jsx", error: String((e && e.message) || e) }); }

// components/pack/UploadChecklist.jsx
try { (() => {
const STATE = {
  done: {
    tone: "success",
    key: "uploadState.done",
    icon: "check"
  },
  checking: {
    tone: "info",
    key: "uploadState.checking",
    icon: "loader-circle"
  },
  todo: {
    tone: "neutral",
    key: "uploadState.todo",
    icon: "circle-dashed"
  },
  redo: {
    tone: "warning",
    key: "uploadState.redo",
    icon: "rotate-ccw"
  },
  optional: {
    tone: "neutral",
    key: "uploadState.optional",
    icon: "circle-dashed"
  }
};

/**
 * The upload checklist. Every item states WHY it is needed in one plain sentence —
 * that rationale is the difference between a chore and an explainable process.
 */
function UploadChecklist({
  items = [],
  onAction,
  style
}) {
  return /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "grid",
      gap: "var(--space-3)",
      ...style
    }
  }, items.map(it => {
    const s = STATE[it.state] || STATE.todo;
    return /*#__PURE__*/React.createElement("li", {
      key: it.id,
      style: {
        display: "flex",
        gap: "var(--space-3)",
        padding: "var(--space-4)",
        background: "var(--white)",
        border: `1px solid ${it.state === "redo" ? "var(--amber-100)" : "var(--border-subtle)"}`,
        borderRadius: "var(--radius-card)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: "none",
        width: 32,
        height: 32,
        display: "grid",
        placeItems: "center",
        borderRadius: "50%",
        background: it.state === "done" ? "var(--green-50)" : it.state === "redo" ? "var(--amber-50)" : "var(--ink-100)",
        color: it.state === "done" ? "var(--green-600)" : it.state === "redo" ? "var(--amber-600)" : "var(--text-faint)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: s.icon,
      size: 17
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--fs-16)",
        fontWeight: "var(--fw-medium)",
        color: "var(--text-heading)"
      }
    }, it.title), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
      size: "sm",
      tone: s.tone
    }, __ds_scope.t(s.key))), /*#__PURE__*/React.createElement("p", {
      style: {
        marginTop: 4,
        fontSize: "var(--fs-14)",
        color: "var(--text-muted)",
        lineHeight: 1.7
      }
    }, it.rationale), it.detail ? /*#__PURE__*/React.createElement("p", {
      style: {
        marginTop: "var(--space-2)",
        fontSize: "var(--fs-14)",
        color: it.state === "redo" ? "var(--amber-600)" : "var(--text-faint)"
      }
    }, it.detail) : null, it.files && it.files.length ? /*#__PURE__*/React.createElement("ul", {
      style: {
        listStyle: "none",
        margin: "var(--space-3) 0 0",
        padding: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--space-2)"
      }
    }, it.files.map(f => /*#__PURE__*/React.createElement("li", {
      key: f,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px var(--space-3)",
        background: "var(--ink-50)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-chip)",
        fontSize: "var(--fs-12)",
        color: "var(--text-muted)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "paperclip",
      size: 13
    }), f))) : null), onAction ? /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onAction(it.id),
      style: {
        alignSelf: "center",
        flex: "none",
        minHeight: "var(--touch-min)",
        padding: "0 var(--space-4)",
        background: it.state === "done" ? "transparent" : "var(--white)",
        border: "1px solid var(--action-secondary-border)",
        borderRadius: "var(--radius-control)",
        color: "var(--action-secondary-fg)",
        fontSize: "var(--fs-14)",
        cursor: "pointer"
      }
    }, it.state === "done" ? __ds_scope.t("upload.replace") : __ds_scope.t("upload.upload")) : null);
  }));
}
Object.assign(__ds_scope, { UploadChecklist });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pack/UploadChecklist.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppHeader.jsx
try { (() => {
const {
  SiteHeader,
  Sheet,
  LanguageSwitcher,
  Locale
} = window.VisaMasterDesignSystem_744fbe;

/* App header. The language switcher sits in the desktop nav; on mobile it lives inside
   the collapsed nav sheet, so it never takes a top-level mobile nav slot. */
function AppHeader({
  mobile,
  lang = "zh-CN",
  onLang,
  nav,
  action
}) {
  const c = APP_TEXT[lang] || APP_TEXT["zh-CN"];
  const items = nav || [{
    label: c.help
  }];
  const [menu, setMenu] = React.useState(false);
  const setLang = l => {
    Locale.set(l);
    onLang && onLang(l);
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SiteHeader, {
    compact: mobile,
    nav: items,
    action: action,
    onMenu: () => setMenu(true),
    language: /*#__PURE__*/React.createElement(LanguageSwitcher, {
      value: lang,
      onChange: setLang
    })
  }), /*#__PURE__*/React.createElement(Sheet, {
    open: mobile && menu,
    mode: "sheet",
    title: c.menu,
    onClose: () => setMenu(false)
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "grid",
      gap: 2,
      marginBlockEnd: "var(--space-5)"
    }
  }, items.concat(items.some(n => n.label === c.myApp) ? [] : [{
    label: c.myApp
  }]).map(n => /*#__PURE__*/React.createElement("a", {
    key: n.label,
    href: "#",
    style: {
      minHeight: "var(--touch-min)",
      display: "flex",
      alignItems: "center",
      fontSize: 16,
      color: "var(--text-body)",
      textDecoration: "none"
    }
  }, n.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBlockStart: "var(--space-4)",
      borderBlockStart: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(LanguageSwitcher, {
    value: lang,
    onChange: setLang,
    placement: "nav"
  }))));
}
Object.assign(window, {
  AppHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/IntakeStep.jsx
try { (() => {
const {
  Button,
  Callout,
  Question,
  RadioGroup,
  Input,
  DateInput,
  ErrorSummary,
  StepProgress,
  BackLink,
  StickyActionBar,
  SaveResumeNotice,
  Sheet,
  Locale
} = window.VisaMasterDesignSystem_744fbe;
function IntakeStep({
  mobile,
  index = 0,
  lang = "zh-CN",
  onLang,
  onNext,
  onPrev,
  onExit
}) {
  const c = APP_TEXT[lang] || APP_TEXT["zh-CN"];
  Locale.set(lang);
  const q = c.questions[Math.min(index, c.questions.length - 1)];
  const [radio, setRadio] = React.useState("tour");
  const [date, setDate] = React.useState({
    year: "2026",
    month: "09",
    day: ""
  });
  const [pass, setPass] = React.useState("E12345");
  const [showErr, setShowErr] = React.useState(false);
  const [sheet, setSheet] = React.useState(false);
  const invalid = q.id === "passport-no" && showErr;
  const control = q.kind === "radio" ? /*#__PURE__*/React.createElement(RadioGroup, {
    name: "purpose",
    value: radio,
    onChange: setRadio,
    options: q.options,
    columns: 1
  }) : q.kind === "date" ? /*#__PURE__*/React.createElement(DateInput, {
    value: date,
    onChange: setDate,
    hint: q.dateHint
  }) : /*#__PURE__*/React.createElement(Input, {
    id: "passport-no",
    width: "md",
    value: pass,
    onChange: e => setPass(e.target.value),
    error: invalid ? q.error : undefined,
    inputMode: "text"
  });
  return /*#__PURE__*/React.createElement("div", {
    lang: lang,
    style: {
      minHeight: mobile ? 720 : 760,
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    mobile: mobile,
    lang: lang,
    onLang: onLang,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      icon: "save",
      onClick: onExit
    }, c.saveExit)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mobile ? "12px var(--gutter-mobile)" : "16px var(--gutter-desktop)",
      background: "var(--white)",
      borderBlockEnd: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxInlineSize: "var(--container-narrow)",
      marginInline: "auto"
    }
  }, /*#__PURE__*/React.createElement(StepProgress, {
    section: c.sectionNow,
    step: q.step,
    total: 34,
    sections: mobile ? [] : c.sections
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: mobile ? "8px var(--gutter-mobile) 24px" : "24px var(--gutter-desktop) 48px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxInlineSize: "var(--container-narrow)",
      marginInline: "auto"
    }
  }, /*#__PURE__*/React.createElement(BackLink, {
    onClick: e => {
      e.preventDefault();
      onPrev && onPrev();
    }
  }), invalid ? /*#__PURE__*/React.createElement(ErrorSummary, {
    errors: [{
      field: "passport-no",
      message: q.error
    }]
  }) : null, /*#__PURE__*/React.createElement(Question, {
    question: q.question,
    hint: q.hint,
    footnote: q.footnote,
    error: invalid ? q.error : undefined
  }, control), q.id === "purpose" ? /*#__PURE__*/React.createElement(Callout, {
    tone: "quiet",
    icon: "info",
    style: {
      marginBlockStart: 28,
      maxInlineSize: "var(--measure-question)"
    }
  }, c.purposeNote) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBlockStart: 28,
      maxInlineSize: "var(--measure-question)"
    }
  }, /*#__PURE__*/React.createElement(SaveResumeNotice, {
    email: "ling@example.com",
    onSend: () => setSheet(true)
  })))), /*#__PURE__*/React.createElement(StickyActionBar, {
    note: mobile ? c.autosaved : undefined,
    secondary: !mobile ? /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onPrev
    }, c.prev) : undefined
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: mobile,
    onClick: () => {
      if (q.id === "passport-no" && pass.length < 9) {
        setShowErr(true);
        return;
      }
      setShowErr(false);
      onNext && onNext();
    }
  }, c.next)), /*#__PURE__*/React.createElement(Sheet, {
    open: sheet,
    title: c.sendTitle,
    description: c.sendBody,
    onClose: () => setSheet(false),
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: mobile,
      onClick: () => setSheet(false)
    }, c.send), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      block: mobile,
      onClick: () => setSheet(false)
    }, c.cancel))
  }, /*#__PURE__*/React.createElement(Input, {
    label: c.email,
    defaultValue: "ling@example.com",
    width: "full"
  })));
}
Object.assign(window, {
  IntakeStep
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/IntakeStep.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/PackDelivery.jsx
try { (() => {
const {
  Button,
  Card,
  Badge,
  Callout,
  Icon,
  PackFileTree,
  FilePreview,
  ConsistencyReport,
  CitationPanel,
  TrustRow,
  Sheet,
  Locale
} = window.VisaMasterDesignSystem_744fbe;
function PackDelivery({
  mobile,
  lang = "zh-CN",
  onLang
}) {
  const c = APP_TEXT[lang] || APP_TEXT["zh-CN"];
  Locale.set(lang);
  const [sel, setSel] = React.useState("f6");
  const [tab, setTab] = React.useState("file");
  const [openTree, setOpenTree] = React.useState(false);
  const file = c.files[sel] || c.fallbackFile;
  const tree = /*#__PURE__*/React.createElement(Card, {
    padding: "8px",
    header: /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "folder-open",
      size: 18,
      style: {
        color: "var(--blue-600)"
      }
    }), c.treeHeader),
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      block: true,
      icon: "download"
    }, c.downloadAll)
  }, /*#__PURE__*/React.createElement(PackFileTree, {
    tree: c.tree,
    selectedId: sel,
    onSelect: n => {
      setSel(n.id);
      setTab("file");
      setOpenTree(false);
    }
  }));
  const right = /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      borderBlockEnd: "1px solid var(--border-subtle)",
      paddingBlockEnd: 12
    }
  }, c.tabs.map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    onClick: () => setTab(k),
    style: {
      minHeight: 40,
      paddingInline: 14,
      border: 0,
      borderRadius: "var(--radius-control)",
      cursor: "pointer",
      background: tab === k ? "var(--surface-selected)" : "transparent",
      color: tab === k ? "var(--blue-800)" : "var(--text-muted)",
      fontSize: 15,
      fontWeight: tab === k ? 600 : 400
    }
  }, l))), tab === "file" ? /*#__PURE__*/React.createElement(FilePreview, {
    file: file
  }) : null, tab === "check" ? /*#__PURE__*/React.createElement(ConsistencyReport, {
    summary: c.checkSummary,
    onResolve: () => {},
    items: c.checks
  }) : null, tab === "src" ? /*#__PURE__*/React.createElement(CitationPanel, {
    checkedAt: "2026-08-01",
    sources: c.sources,
    caveats: c.caveats
  }) : null);
  return /*#__PURE__*/React.createElement("div", {
    lang: lang,
    style: {
      minHeight: mobile ? 720 : 760,
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    mobile: mobile,
    lang: lang,
    onLang: onLang,
    nav: [{
      label: c.myApp
    }, {
      label: c.help
    }],
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: "download"
    }, c.downloadShort)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mobile ? "20px var(--gutter-mobile)" : "28px var(--gutter-desktop)",
      background: "var(--white)",
      borderBlockEnd: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxInlineSize: "var(--container-max)",
      marginInline: "auto"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    icon: "check"
  }, c.packBadge), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginBlockStart: 12,
      fontSize: mobile ? 24 : 30,
      lineHeight: "var(--type-h2-lh)"
    }
  }, c.packTitle), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBlockStart: 10,
      fontSize: 15,
      color: "var(--text-muted)",
      lineHeight: "var(--type-body-lh)",
      maxInlineSize: "42em"
    }
  }, c.packLede), /*#__PURE__*/React.createElement(TrustRow, {
    style: {
      marginBlockStart: 16
    },
    items: c.packTrust
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      padding: mobile ? "16px var(--gutter-mobile) 40px" : "24px var(--gutter-desktop) 64px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxInlineSize: "var(--container-max)",
      marginInline: "auto"
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "warning",
    title: c.packWarnTitle,
    style: {
      marginBlockEnd: 20
    }
  }, c.packWarn), mobile ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    block: true,
    icon: "folder-open",
    onClick: () => setOpenTree(true)
  }, c.openTree), right, /*#__PURE__*/React.createElement(Sheet, {
    open: openTree,
    mode: "sheet",
    title: c.treeSheet,
    onClose: () => setOpenTree(false)
  }, /*#__PURE__*/React.createElement(PackFileTree, {
    tree: c.tree,
    selectedId: sel,
    onSelect: n => {
      setSel(n.id);
      setTab("file");
      setOpenTree(false);
    }
  }))) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(280px,340px) 1fr",
      gap: 32,
      alignItems: "start"
    }
  }, tree, /*#__PURE__*/React.createElement(Card, null, right)))));
}
Object.assign(window, {
  PackDelivery
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/PackDelivery.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/UploadStep.jsx
try { (() => {
const {
  Button,
  Card,
  Callout,
  StepProgress,
  BackLink,
  StickyActionBar,
  UploadChecklist,
  ResumableUploader,
  CameraCaptureLoop,
  Locale
} = window.VisaMasterDesignSystem_744fbe;
function UploadStep({
  mobile,
  lang = "zh-CN",
  onLang,
  onNext,
  onPrev
}) {
  const c = APP_TEXT[lang] || APP_TEXT["zh-CN"];
  Locale.set(lang);
  const [mode, setMode] = React.useState("list");
  const [pages, setPages] = React.useState([{
    id: "p1"
  }, {
    id: "p2"
  }]);
  const sections = c.sections.map(s => ({
    name: s.name,
    state: s.name === c.uploadSection ? "current" : "done"
  }));
  return /*#__PURE__*/React.createElement("div", {
    lang: lang,
    style: {
      minHeight: mobile ? 720 : 760,
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement(AppHeader, {
    mobile: mobile,
    lang: lang,
    onLang: onLang,
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      icon: "save"
    }, c.saveExit)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: mobile ? "12px var(--gutter-mobile)" : "16px var(--gutter-desktop)",
      background: "var(--white)",
      borderBlockEnd: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxInlineSize: "var(--container-narrow)",
      marginInline: "auto"
    }
  }, /*#__PURE__*/React.createElement(StepProgress, {
    section: c.uploadSection,
    step: 29,
    total: 34,
    sections: mobile ? [] : sections
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: mobile ? "8px var(--gutter-mobile) 24px" : "24px var(--gutter-desktop) 48px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxInlineSize: "var(--container-narrow)",
      marginInline: "auto"
    }
  }, /*#__PURE__*/React.createElement(BackLink, {
    onClick: e => {
      e.preventDefault();
      onPrev && onPrev();
    }
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginBlockStart: 8,
      fontSize: "var(--type-question-size)",
      lineHeight: "var(--type-question-lh)"
    }
  }, c.uploadTitle), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBlockStart: 8,
      fontSize: 14,
      color: "var(--text-muted)",
      lineHeight: "var(--type-hint-lh)",
      maxInlineSize: "var(--measure-question)"
    }
  }, c.uploadLede), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      margin: "20px 0"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: mode === "list" ? "primary" : "secondary",
    size: "sm",
    onClick: () => setMode("list")
  }, c.modeList), /*#__PURE__*/React.createElement(Button, {
    variant: mode === "drop" ? "primary" : "secondary",
    size: "sm",
    onClick: () => setMode("drop")
  }, mobile ? c.modePick : c.modeDrop), /*#__PURE__*/React.createElement(Button, {
    variant: mode === "cam" ? "primary" : "secondary",
    size: "sm",
    icon: "camera",
    onClick: () => setMode("cam")
  }, c.modeCam)), mode === "list" ? /*#__PURE__*/React.createElement(UploadChecklist, {
    items: c.items,
    onAction: () => setMode("drop")
  }) : null, mode === "drop" ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Callout, {
    tone: "warning",
    title: c.dropTitle
  }, c.dropBody), /*#__PURE__*/React.createElement(ResumableUploader, {
    onPick: () => {},
    onRetry: () => {},
    files: [{
      name: "bank-statement-2026Q2.pdf",
      size: "18.4MB",
      progress: 62,
      state: "failed"
    }, {
      name: "passport-page.jpg",
      size: "2.1MB",
      progress: 100,
      state: "done"
    }]
  })) : null, mode === "cam" ? /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18
    }
  }, c.camTitle), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 16px",
      fontSize: 14,
      color: "var(--text-muted)",
      lineHeight: "var(--type-hint-lh)"
    }
  }, c.camBody), /*#__PURE__*/React.createElement(CameraCaptureLoop, {
    pages: pages,
    onCapture: () => setPages(p => [...p, {
      id: "p" + (p.length + 1)
    }]),
    onRemove: id => setPages(p => p.filter(x => x.id !== id)),
    onMove: (i, d) => setPages(p => {
      const n = [...p];
      const j = i + d;
      if (j < 0 || j >= n.length) return p;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    })
  })) : null)), /*#__PURE__*/React.createElement(StickyActionBar, {
    note: mobile ? c.autosaved : undefined,
    secondary: !mobile ? /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: onPrev
    }, c.prev) : undefined
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: mobile,
    onClick: onNext
  }, c.submit)));
}
Object.assign(window, {
  UploadStep
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/UploadStep.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/copy.jsx
try { (() => {
/* Screen copy for the intake + delivery kit, in both shipped languages. */
const APP_TEXT = {
  "zh-CN": {
    menu: "菜单",
    help: "帮助",
    myApp: "我的申请",
    saveExit: "保存并退出",
    next: "继续",
    prev: "上一步",
    autosaved: "已自动保存，可随时关闭页面",
    sections: [{
      name: "基本信息",
      state: "done"
    }, {
      name: "证件",
      state: "done"
    }, {
      name: "行程与费用",
      state: "current"
    }, {
      name: "在职与收入",
      state: "todo"
    }, {
      name: "上传材料",
      state: "todo"
    }],
    sectionNow: "行程与费用",
    questions: [{
      id: "purpose",
      step: 12,
      kind: "radio",
      question: "你这次去申根国家主要做什么？",
      hint: "选择最接近的一项。后面会根据它决定需要哪些材料，选错了也可以回来改。",
      options: [{
        value: "tour",
        title: "旅游",
        hint: "包括探访朋友，但不住在对方家里"
      }, {
        value: "visit",
        title: "探亲访友",
        hint: "需要对方出具邀请函，并附上对方的身份或居留证明"
      }, {
        value: "biz",
        title: "商务出差",
        hint: "需要对方公司的邀请函，以及你所在公司的派遣函"
      }, {
        value: "study",
        title: "短期培训或学习",
        hint: "不超过 90 天的课程、研讨或交流"
      }],
      footnote: "如果这次行程有多个目的，选择停留时间最长的那一个。"
    }, {
      id: "entry",
      step: 13,
      kind: "date",
      question: "你打算哪一天入境申根区？",
      hint: "按你目前的计划填写。还没订机票也没关系，之后可以改。",
      dateHint: "例如 2026 年 09 月 01 日"
    }, {
      id: "passport-no",
      step: 14,
      kind: "text",
      question: "你的护照号码是多少？",
      hint: "请与护照资料页完全一致，包括字母大小写。这个号码会自动填进申请表。",
      error: "护照号码需要 9 位，请检查后重新填写"
    }],
    purposeNote: "这一步只影响材料清单，不会提交给使领馆。",
    sendTitle: "把续填链接发到邮箱？",
    sendBody: "我们只发这一封，不做营销推送。",
    send: "发送",
    cancel: "取消",
    email: "邮箱",
    uploadSection: "上传材料",
    uploadTitle: "还差 3 份材料",
    uploadLede: "每一项都写了为什么需要。可以现在传，也可以先跳过，之后回来补。",
    modeList: "清单",
    modeDrop: "拖拽上传",
    modePick: "选择文件",
    modeCam: "连续拍照",
    items: [{
      id: "u1",
      title: "护照资料页",
      rationale: "用来核对姓名拼写与有效期，姓名会自动填进申请表。",
      state: "done",
      files: ["passport-page.jpg"]
    }, {
      id: "u2",
      title: "近三个月银行流水",
      rationale: "使馆用它判断你能负担这次行程的费用。",
      state: "redo",
      detail: "上一份缺少第 3 页，请重新上传完整版。"
    }, {
      id: "u3",
      title: "在职证明",
      rationale: "说明你有稳定的工作和回国的理由。我们会提供可编辑模板。",
      state: "checking"
    }, {
      id: "u4",
      title: "户口本（全本）",
      rationale: "用于核对家庭关系，部分使馆要求。",
      state: "todo"
    }, {
      id: "u5",
      title: "结婚证",
      rationale: "只有在配偶随行或作为担保人时才需要。",
      state: "optional"
    }],
    dropTitle: "银行流水需要重新上传",
    dropBody: "上一份缺少第 3 页。请上传覆盖最近三个月、页码连续的完整版。",
    camTitle: "拍摄户口本",
    camBody: "一页一张，按顺序拍。拍完可以调整顺序，顺序会影响打印出来的次序。",
    submit: "提交给人工复核",
    packBadge: "已完成人工复核 · 2026-08-08",
    packTitle: "法国短期旅游签证 · 材料包已准备好",
    packLede: "共 14 份文件。先看「打印与递交清单」，按顺序打印即可。还有 1 项需要你确认，见一致性校验。",
    packTrust: [{
      label: "官方来源核对于 2026-08-01",
      icon: "book-open-text"
    }, {
      label: "42 项一致性校验",
      icon: "git-compare-arrows"
    }, {
      label: "人工复核 · 李工",
      icon: "user-check"
    }],
    packWarnTitle: "有 1 项需要你确认",
    packWarn: "在职证明与社保记录上的入职日期差了两个月。在一致性校验里可以看到具体位置和处理方式。",
    treeHeader: "材料包 · 14 份",
    downloadAll: "全部下载（ZIP）",
    downloadShort: "全部下载",
    openTree: "打开材料包目录（14 份）",
    treeSheet: "材料包目录",
    tabs: [["file", "文件说明"], ["check", "一致性校验"], ["src", "来源与提醒"]],
    checkSummary: "共检查 42 项，1 项需要你确认，1 项建议核对。",
    tree: [{
      id: "s1",
      name: "从这里开始",
      children: [{
        id: "f1",
        name: "打印与递交清单.pdf",
        kind: "pdf",
        language: "zh-CN",
        status: "ready"
      }, {
        id: "f2",
        name: "面签当天带什么.pdf",
        kind: "pdf",
        language: "zh-CN",
        status: "ready"
      }]
    }, {
      id: "s2",
      name: "官方文件",
      count: 4,
      children: [{
        id: "f3",
        name: "申根签证申请表（已填）.pdf",
        kind: "pdf",
        language: "fr",
        status: "ready"
      }, {
        id: "f4",
        name: "使馆材料清单（原件）.pdf",
        kind: "pdf",
        language: "fr",
        status: "official"
      }, {
        id: "f5",
        name: "预约确认页.pdf",
        kind: "pdf",
        language: "fr",
        status: "ready"
      }]
    }, {
      id: "s3",
      name: "可编辑模板",
      children: [{
        id: "f6",
        name: "在职证明（模板）.docx",
        kind: "doc",
        language: {
          code: "zh-CN",
          name: "中文 / English"
        },
        status: "review"
      }, {
        id: "f7",
        name: "行程说明（模板）.docx",
        kind: "doc",
        language: {
          code: "zh-CN",
          name: "中文 / English"
        },
        status: "ready"
      }, {
        id: "f8",
        name: "费用承担说明（模板）.docx",
        kind: "doc",
        language: {
          code: "zh-CN",
          name: "中文 / English"
        },
        status: "ready"
      }]
    }, {
      id: "s4",
      name: "本人材料",
      children: [{
        id: "f9",
        name: "护照资料页.jpg",
        kind: "img",
        language: {
          code: "zh-CN",
          name: "中文 / English"
        },
        status: "ready"
      }, {
        id: "f10",
        name: "银行流水.pdf",
        kind: "pdf",
        language: "zh-CN",
        status: "waiting"
      }, {
        id: "f11",
        name: "户口本（6 页）.pdf",
        kind: "pdf",
        language: "zh-CN",
        status: "ready"
      }]
    }, {
      id: "s5",
      name: "来源与提醒",
      children: [{
        id: "f12",
        name: "本次材料的官方来源",
        kind: "link",
        language: "zh-CN",
        status: "ready"
      }]
    }],
    files: {
      f6: {
        name: "在职证明（模板）.docx",
        badge: "人工复核中",
        badgeTone: "info",
        pages: 1,
        updated: "2 小时前更新",
        purpose: "使馆用这份文件确认你有稳定的工作和回国的理由。模板已按你填写的公司名称、职位和入职日期生成，抬头和落款留给公司填。",
        instructions: ["打印在公司抬头纸上，由 HR 或直属主管签字并加盖公章。", "落款日期需在递交前 30 天内。", "如果公司要求先看内容，可以把这份文件直接发给 HR。"]
      },
      f1: {
        name: "打印与递交清单.pdf",
        badge: "先看这份",
        badgeTone: "success",
        pages: 2,
        updated: "刚刚生成",
        purpose: "按递交顺序列出全部 14 份材料，标明哪些要原件、哪些要复印件、哪些需要签字。",
        instructions: ["按清单顺序打印并排好。", "打勾确认每一项都在文件夹里。", "面签当天把这张清单放在最上面。"]
      },
      f10: {
        name: "银行流水.pdf",
        badge: "待你补充",
        badgeTone: "warning",
        pages: 0,
        updated: "缺少第 3 页",
        purpose: "使馆用它判断你能负担这次行程的费用。需要覆盖最近三个月、页码连续。",
        instructions: ["回到「上传材料」重新上传完整版。", "银行盖章的版本更稳妥，但不是必须。"]
      }
    },
    fallbackFile: {
      name: "示例文件",
      purpose: "选择左侧任意一份文件查看说明。",
      instructions: []
    },
    checks: [{
      id: "c1",
      field: "在职起始日期",
      severity: "conflict",
      readings: [{
        source: "在职证明",
        value: "2021-03-01"
      }, {
        source: "社保记录",
        value: "2021-05-01"
      }],
      action: "两处日期不一致。请以社保记录为准，或让公司出具一份更正说明。"
    }, {
      id: "c2",
      field: "出行城市",
      severity: "check",
      readings: [{
        source: "机票预订",
        value: "巴黎 CDG"
      }, {
        source: "住宿预订",
        value: "里昂"
      }],
      action: "行程里没有说明从巴黎去里昂的方式。补一张火车票，或在行程说明里写清楚。"
    }, {
      id: "c3",
      field: "护照有效期",
      severity: "pass",
      readings: [{
        source: "护照资料页",
        value: "2031-04-18"
      }, {
        source: "计划返程",
        value: "2026-09-14"
      }]
    }],
    sources: [{
      title: "法国驻华使馆 · 短期签证材料清单",
      publisher: "France-Visas",
      url: "france-visas.gouv.fr",
      quote: "银行对账单需覆盖最近三个月。"
    }, {
      title: "申根签证通用要求",
      publisher: "European Commission",
      url: "ec.europa.eu"
    }, {
      title: "签证中心预约与递交流程",
      publisher: "VFS Global",
      url: "vfsglobal.cn"
    }],
    caveats: ["最终是否受理与批准由使领馆决定，本服务不代办、不承诺结果。", "官方要求可能随时调整。这份材料包核对于 2026-08-01。"]
  },
  en: {
    menu: "Menu",
    help: "Help",
    myApp: "My application",
    saveExit: "Save and exit",
    next: "Continue",
    prev: "Previous step",
    autosaved: "Saved automatically — you can close this page at any time",
    sections: [{
      name: "About you",
      state: "done"
    }, {
      name: "Identity documents",
      state: "done"
    }, {
      name: "Itinerary and costs",
      state: "current"
    }, {
      name: "Employment and income",
      state: "todo"
    }, {
      name: "Uploads",
      state: "todo"
    }],
    sectionNow: "Itinerary and costs",
    questions: [{
      id: "purpose",
      step: 12,
      kind: "radio",
      question: "What is the main purpose of this trip to the Schengen area?",
      hint: "Choose the closest match. This decides which documents you need, and you can come back and change it.",
      options: [{
        value: "tour",
        title: "Tourism",
        hint: "Includes visiting friends, as long as you are not staying at their home"
      }, {
        value: "visit",
        title: "Visiting family or friends",
        hint: "Needs an invitation letter from them, plus proof of their identity or residence"
      }, {
        value: "biz",
        title: "Business travel",
        hint: "Needs an invitation from the host company and a letter from your own employer"
      }, {
        value: "study",
        title: "Short course or training",
        hint: "Courses, seminars or exchanges of no more than 90 days"
      }],
      footnote: "If this trip has more than one purpose, choose the one you will spend the most time on."
    }, {
      id: "entry",
      step: 13,
      kind: "date",
      question: "Which day do you plan to enter the Schengen area?",
      hint: "Fill in your current plan. It is fine if you have not booked flights yet — you can change it later.",
      dateHint: "For example 2026 / 09 / 01"
    }, {
      id: "passport-no",
      step: 14,
      kind: "text",
      question: "What is your passport number?",
      hint: "It has to match the passport data page exactly, including capital letters. We fill this into the application form for you.",
      error: "A passport number has 9 characters. Please check it and enter it again."
    }],
    purposeNote: "This answer only affects your document list. It is not sent to the consulate.",
    sendTitle: "Email yourself the link back?",
    sendBody: "One email, nothing else. We do not send marketing.",
    send: "Send it",
    cancel: "Not now",
    email: "Email address",
    uploadSection: "Uploads",
    uploadTitle: "Three documents still to go",
    uploadLede: "Each item says why it is needed. Upload now, or skip and come back to it later.",
    modeList: "Checklist",
    modeDrop: "Drag and drop",
    modePick: "Choose files",
    modeCam: "Photograph pages",
    items: [{
      id: "u1",
      title: "Passport data page",
      rationale: "Used to check the spelling of your name and the expiry date. The name is filled into the form for you.",
      state: "done",
      files: ["passport-page.jpg"]
    }, {
      id: "u2",
      title: "Bank statement, last three months",
      rationale: "The consulate uses it to judge whether you can cover the cost of this trip.",
      state: "redo",
      detail: "The last one was missing page 3. Please upload the complete version."
    }, {
      id: "u3",
      title: "Employment letter",
      rationale: "Shows that you have steady work and a reason to return. We give you an editable template.",
      state: "checking"
    }, {
      id: "u4",
      title: "Household register, all pages",
      rationale: "Used to check family relationships. Some consulates require it.",
      state: "todo"
    }, {
      id: "u5",
      title: "Marriage certificate",
      rationale: "Only needed if your spouse travels with you or acts as your sponsor.",
      state: "optional"
    }],
    dropTitle: "The bank statement needs uploading again",
    dropBody: "The last one was missing page 3. Please upload a complete version covering the last three months with no gaps in the page numbers.",
    camTitle: "Photograph the household register",
    camBody: "One page per photo, in order. You can reorder them afterwards — the order is the order they print in.",
    submit: "Send for human review",
    packBadge: "Human review completed · 2026-08-08",
    packTitle: "French short-stay tourist visa · your pack is ready",
    packLede: "14 documents. Start with the printing and submission checklist and print in that order. One item still needs confirming — see the consistency check.",
    packTrust: [{
      label: "Official sources checked 2026-08-01",
      icon: "book-open-text"
    }, {
      label: "42 consistency checks",
      icon: "git-compare-arrows"
    }, {
      label: "Human review · Li",
      icon: "user-check"
    }],
    packWarnTitle: "One item needs confirming",
    packWarn: "The employment letter and the social-insurance record give start dates two months apart. The consistency check shows where and what to do about it.",
    treeHeader: "Document pack · 14 files",
    downloadAll: "Download everything (ZIP)",
    downloadShort: "Download all",
    openTree: "Open the pack contents (14 files)",
    treeSheet: "Pack contents",
    tabs: [["file", "About this file"], ["check", "Consistency check"], ["src", "Sources and caveats"]],
    checkSummary: "42 items checked. 1 needs confirming, 1 is worth checking.",
    tree: [{
      id: "s1",
      name: "Start here",
      children: [{
        id: "f1",
        name: "Printing and submission checklist.pdf",
        kind: "pdf",
        language: "zh-CN",
        status: "ready"
      }, {
        id: "f2",
        name: "What to bring on the day.pdf",
        kind: "pdf",
        language: "zh-CN",
        status: "ready"
      }]
    }, {
      id: "s2",
      name: "Official documents",
      count: 4,
      children: [{
        id: "f3",
        name: "Schengen application form (completed).pdf",
        kind: "pdf",
        language: "fr",
        status: "ready"
      }, {
        id: "f4",
        name: "Consulate document list (original).pdf",
        kind: "pdf",
        language: "fr",
        status: "official"
      }, {
        id: "f5",
        name: "Appointment confirmation.pdf",
        kind: "pdf",
        language: "fr",
        status: "ready"
      }]
    }, {
      id: "s3",
      name: "Editable templates",
      children: [{
        id: "f6",
        name: "Employment letter (template).docx",
        kind: "doc",
        language: {
          code: "zh-CN",
          name: "中文 / English"
        },
        status: "review"
      }, {
        id: "f7",
        name: "Itinerary statement (template).docx",
        kind: "doc",
        language: {
          code: "zh-CN",
          name: "中文 / English"
        },
        status: "ready"
      }, {
        id: "f8",
        name: "Statement of who pays (template).docx",
        kind: "doc",
        language: {
          code: "zh-CN",
          name: "中文 / English"
        },
        status: "ready"
      }]
    }, {
      id: "s4",
      name: "Your own documents",
      children: [{
        id: "f9",
        name: "Passport data page.jpg",
        kind: "img",
        language: {
          code: "zh-CN",
          name: "中文 / English"
        },
        status: "ready"
      }, {
        id: "f10",
        name: "Bank statement.pdf",
        kind: "pdf",
        language: "zh-CN",
        status: "waiting"
      }, {
        id: "f11",
        name: "Household register (6 pages).pdf",
        kind: "pdf",
        language: "zh-CN",
        status: "ready"
      }]
    }, {
      id: "s5",
      name: "Sources and caveats",
      children: [{
        id: "f12",
        name: "Official sources for this pack",
        kind: "link",
        language: "zh-CN",
        status: "ready"
      }]
    }],
    files: {
      f6: {
        name: "Employment letter (template).docx",
        badge: "In human review",
        badgeTone: "info",
        pages: 1,
        updated: "updated 2 hours ago",
        purpose: "The consulate uses this to confirm that you have steady work and a reason to come back. The template already carries the employer, job title and start date you gave us; the letterhead and signature are for your company to add.",
        instructions: ["Print it on company letterhead and have HR or your line manager sign and stamp it.", "The date on it must be within 30 days of your submission.", "If your company wants to see the wording first, send them this file as it is."]
      },
      f1: {
        name: "Printing and submission checklist.pdf",
        badge: "Read this first",
        badgeTone: "success",
        pages: 2,
        updated: "generated just now",
        purpose: "Lists all 14 documents in submission order, and marks which need to be originals, which are copies, and which need a signature.",
        instructions: ["Print and arrange the documents in the order on the checklist.", "Tick each line once it is in the folder.", "Keep this checklist on top on the day of your appointment."]
      },
      f10: {
        name: "Bank statement.pdf",
        badge: "Waiting on you",
        badgeTone: "warning",
        pages: 0,
        updated: "page 3 missing",
        purpose: "The consulate uses it to judge whether you can cover the cost of the trip. It has to cover the last three months with no gaps in the page numbers.",
        instructions: ["Go back to Uploads and upload the complete version.", "A version stamped by the bank is safer, but it is not required."]
      }
    },
    fallbackFile: {
      name: "Example file",
      purpose: "Choose any file on the left to see what it is for.",
      instructions: []
    },
    checks: [{
      id: "c1",
      field: "Employment start date",
      severity: "conflict",
      readings: [{
        source: "Employment letter",
        value: "2021-03-01"
      }, {
        source: "Social insurance record",
        value: "2021-05-01"
      }],
      action: "The two dates disagree. Use the social-insurance date, or ask your employer for a short correction letter."
    }, {
      id: "c2",
      field: "Destination city",
      severity: "check",
      readings: [{
        source: "Flight booking",
        value: "Paris CDG"
      }, {
        source: "Accommodation",
        value: "Lyon"
      }],
      action: "Your itinerary does not say how you travel from Paris to Lyon. Add a train ticket, or explain it in the itinerary statement."
    }, {
      id: "c3",
      field: "Passport validity",
      severity: "pass",
      readings: [{
        source: "Passport data page",
        value: "2031-04-18"
      }, {
        source: "Planned return",
        value: "2026-09-14"
      }]
    }],
    sources: [{
      title: "French Embassy in China · short-stay document list",
      publisher: "France-Visas",
      url: "france-visas.gouv.fr",
      quote: "Bank statements must cover the last three months."
    }, {
      title: "General Schengen visa requirements",
      publisher: "European Commission",
      url: "ec.europa.eu"
    }, {
      title: "Appointment and submission process",
      publisher: "VFS Global",
      url: "vfsglobal.cn"
    }],
    caveats: ["The consulate decides whether to accept and approve your application. We are not an agency and promise no outcome.", "Official requirements can change. This pack was checked on 2026-08-01."]
  }
};
Object.assign(window, {
  APP_TEXT
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/copy.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Home.jsx
try { (() => {
const {
  Button,
  Card,
  Badge,
  Callout,
  Icon,
  SiteHeader,
  SiteFooter,
  TrustRow,
  PackFileTree,
  ConsistencyReport,
  CitationPanel,
  LanguageSwitcher,
  Sheet,
  Locale
} = window.VisaMasterDesignSystem_744fbe;
function Section({
  children,
  tone,
  pad = 80,
  mobile
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: tone === "soft" ? "var(--surface-page)" : tone === "navy" ? "var(--surface-inverse)" : "var(--white)",
      padding: `${mobile ? 48 : pad}px ${mobile ? "var(--gutter-mobile)" : "var(--gutter-desktop)"}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxInlineSize: "var(--container-max)",
      marginInline: "auto"
    }
  }, children));
}
function Hero({
  mobile,
  onStart,
  c
}) {
  return /*#__PURE__*/React.createElement(Section, {
    pad: mobile ? 40 : 88,
    mobile: mobile
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1.05fr .95fr",
      gap: mobile ? 36 : 64,
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Badge, {
    tone: "info",
    icon: "shield-check"
  }, c.badge), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginBlockStart: 20,
      fontSize: mobile ? 32 : "var(--type-display-size)",
      lineHeight: mobile ? 1.35 : "var(--type-display-lh)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-heading)"
    }
  }, c.title), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBlockStart: 16,
      fontSize: mobile ? 16 : 18,
      lineHeight: "var(--type-body-lh)",
      color: "var(--text-muted)",
      maxInlineSize: "32em"
    }
  }, c.lede), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      marginBlockStart: 28
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: mobile,
    onClick: onStart
  }, c.cta), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    block: mobile,
    iconAfter: "arrow-right"
  }, c.secondaryCta)), /*#__PURE__*/React.createElement(TrustRow, {
    style: {
      marginBlockStart: 28
    },
    items: c.trust
  })), /*#__PURE__*/React.createElement(Card, {
    elevation: 2,
    padding: "0",
    header: /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "folder-open",
      size: 18,
      style: {
        color: "var(--blue-600)"
      }
    }), c.packHeader)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 8px"
    }
  }, /*#__PURE__*/React.createElement(PackFileTree, {
    tree: c.pack,
    selectedId: "f4",
    languageNote: false
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      borderBlockStart: "1px solid var(--border-subtle)",
      background: "var(--ink-50)",
      fontSize: "var(--fs-12)",
      color: "var(--text-faint)"
    }
  }, c.packFoot))));
}
function How({
  mobile,
  c
}) {
  return /*#__PURE__*/React.createElement(Section, {
    tone: "soft",
    mobile: mobile
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: mobile ? 24 : 30,
      lineHeight: "var(--type-h2-lh)"
    }
  }, c.howTitle), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)",
      gap: 20,
      marginBlockStart: 28
    }
  }, c.steps.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.n
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      background: "var(--surface-accent-soft)",
      color: "var(--blue-700)",
      fontFamily: "var(--font-num)",
      fontWeight: 600
    }
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      marginBlockStart: 14,
      fontSize: 18
    }
  }, s.t), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBlockStart: 8,
      fontSize: 14,
      lineHeight: "var(--lh-loose)",
      color: "var(--text-muted)"
    }
  }, s.d)))));
}
function Consistency({
  mobile,
  c
}) {
  return /*#__PURE__*/React.createElement(Section, {
    mobile: mobile
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : ".85fr 1.15fr",
      gap: mobile ? 28 : 56,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: mobile ? 24 : 30,
      lineHeight: "var(--type-h2-lh)"
    }
  }, c.consistencyTitle), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBlockStart: 14,
      fontSize: 16,
      lineHeight: "var(--lh-loose)",
      color: "var(--text-muted)"
    }
  }, c.consistencyBody), /*#__PURE__*/React.createElement(Callout, {
    tone: "quiet",
    icon: "info",
    style: {
      marginBlockStart: 20
    }
  }, c.consistencyNote)), /*#__PURE__*/React.createElement(ConsistencyReport, {
    summary: c.consistencySummary,
    items: c.checks
  })));
}
function Sources({
  mobile,
  c
}) {
  return /*#__PURE__*/React.createElement(Section, {
    tone: "soft",
    mobile: mobile
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
      gap: mobile ? 28 : 56,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(CitationPanel, {
    checkedAt: "2026-08-01",
    sources: c.sources,
    caveats: c.caveats
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: mobile ? 24 : 30,
      lineHeight: "var(--type-h2-lh)"
    }
  }, c.sourcesTitle), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBlockStart: 14,
      fontSize: 16,
      lineHeight: "var(--lh-loose)",
      color: "var(--text-muted)"
    }
  }, c.sourcesBody))));
}
function CTA({
  mobile,
  onStart,
  c
}) {
  return /*#__PURE__*/React.createElement(Section, {
    tone: "navy",
    pad: 64,
    mobile: mobile
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 24,
      alignItems: "center",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxInlineSize: "34em"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: "var(--white)",
      fontSize: mobile ? 22 : 28,
      lineHeight: "var(--type-h2-lh)"
    }
  }, c.ctaTitle), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBlockStart: 10,
      fontSize: 15,
      color: "var(--blue-200)"
    }
  }, c.ctaBody)), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    block: mobile,
    onClick: onStart,
    style: {
      background: "var(--white)",
      color: "var(--blue-900)",
      border: "1px solid var(--white)"
    }
  }, c.cta)));
}
function Home({
  mobile,
  onStart,
  lang = "zh-CN",
  onLang
}) {
  const c = HOME_TEXT[lang] || HOME_TEXT["zh-CN"];
  const [menu, setMenu] = React.useState(false);
  Locale.set(lang);
  const setLang = l => {
    Locale.set(l);
    onLang && onLang(l);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--white)"
    },
    lang: lang
  }, /*#__PURE__*/React.createElement(SiteHeader, {
    compact: mobile,
    nav: c.nav,
    onMenu: () => setMenu(true),
    language: /*#__PURE__*/React.createElement(LanguageSwitcher, {
      value: lang,
      onChange: setLang
    }),
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: onStart
    }, c.cta)
  }), /*#__PURE__*/React.createElement(Sheet, {
    open: mobile && menu,
    mode: "sheet",
    title: c.menu,
    onClose: () => setMenu(false)
  }, /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "grid",
      gap: 2,
      marginBlockEnd: "var(--space-5)"
    }
  }, c.nav.map(n => /*#__PURE__*/React.createElement("a", {
    key: n.label,
    href: "#",
    style: {
      minHeight: "var(--touch-min)",
      display: "flex",
      alignItems: "center",
      fontSize: 16,
      color: "var(--text-body)",
      textDecoration: "none"
    }
  }, n.label))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    block: true,
    onClick: onStart
  }, c.cta), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBlockStart: "var(--space-5)",
      paddingBlockStart: "var(--space-4)",
      borderBlockStart: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(LanguageSwitcher, {
    value: lang,
    onChange: setLang,
    placement: "nav"
  }))), /*#__PURE__*/React.createElement(Hero, {
    mobile: mobile,
    onStart: onStart,
    c: c
  }), /*#__PURE__*/React.createElement(How, {
    mobile: mobile,
    c: c
  }), /*#__PURE__*/React.createElement(Consistency, {
    mobile: mobile,
    c: c
  }), /*#__PURE__*/React.createElement(Sources, {
    mobile: mobile,
    c: c
  }), /*#__PURE__*/React.createElement(CTA, {
    mobile: mobile,
    onStart: onStart,
    c: c
  }), /*#__PURE__*/React.createElement(SiteFooter, {
    note: c.footerNote,
    record: "\u6CAAICP\u590700000000\u53F7-1",
    columns: c.footerCols,
    language: /*#__PURE__*/React.createElement(LanguageSwitcher, {
      value: lang,
      onChange: setLang,
      placement: "footer"
    })
  }));
}
Object.assign(window, {
  Home
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/copy.jsx
try { (() => {
/* Screen copy for the marketing kit, in both shipped languages. Chinese is the source;
   the English is here so the layouts get exercised against 40–60% longer strings. */
const PACK_ZH = [{
  id: "s1",
  name: "从这里开始",
  children: [{
    id: "f1",
    name: "打印与递交清单.pdf",
    kind: "pdf",
    language: "zh-CN",
    status: "ready"
  }, {
    id: "f1b",
    name: "面签当天带什么.pdf",
    kind: "pdf",
    language: "zh-CN",
    status: "ready"
  }]
}, {
  id: "s2",
  name: "官方文件",
  count: 4,
  children: [{
    id: "f2",
    name: "申根签证申请表（已填）.pdf",
    kind: "pdf",
    language: "fr",
    status: "ready"
  }, {
    id: "f3",
    name: "使馆材料清单（原件）.pdf",
    kind: "pdf",
    language: "fr",
    status: "official"
  }]
}, {
  id: "s3",
  name: "可编辑模板",
  children: [{
    id: "f4",
    name: "在职证明（模板）.docx",
    kind: "doc",
    language: {
      code: "zh-CN",
      name: "中文 / English"
    },
    status: "review"
  }, {
    id: "f5",
    name: "行程说明（模板）.docx",
    kind: "doc",
    language: {
      code: "zh-CN",
      name: "中文 / English"
    },
    status: "ready"
  }]
}, {
  id: "s4",
  name: "本人材料",
  children: [{
    id: "f6",
    name: "护照资料页.jpg",
    kind: "img",
    language: {
      code: "zh-CN",
      name: "中文 / English"
    },
    status: "ready"
  }, {
    id: "f7",
    name: "银行流水.pdf",
    kind: "pdf",
    language: "zh-CN",
    status: "waiting"
  }]
}, {
  id: "s5",
  name: "来源与提醒",
  children: [{
    id: "f8",
    name: "本次材料的官方来源",
    kind: "link",
    language: "zh-CN",
    status: "ready"
  }]
}];
const PACK_EN = [{
  id: "s1",
  name: "Start here",
  children: [{
    id: "f1",
    name: "Printing and submission checklist.pdf",
    kind: "pdf",
    language: "zh-CN",
    status: "ready"
  }, {
    id: "f1b",
    name: "What to bring on the day.pdf",
    kind: "pdf",
    language: "zh-CN",
    status: "ready"
  }]
}, {
  id: "s2",
  name: "Official documents",
  count: 4,
  children: [{
    id: "f2",
    name: "Schengen application form (completed).pdf",
    kind: "pdf",
    language: "fr",
    status: "ready"
  }, {
    id: "f3",
    name: "Consulate document list (original).pdf",
    kind: "pdf",
    language: "fr",
    status: "official"
  }]
}, {
  id: "s3",
  name: "Editable templates",
  children: [{
    id: "f4",
    name: "Employment letter (template).docx",
    kind: "doc",
    language: {
      code: "zh-CN",
      name: "中文 / English"
    },
    status: "review"
  }, {
    id: "f5",
    name: "Itinerary statement (template).docx",
    kind: "doc",
    language: {
      code: "zh-CN",
      name: "中文 / English"
    },
    status: "ready"
  }]
}, {
  id: "s4",
  name: "Your own documents",
  children: [{
    id: "f6",
    name: "Passport data page.jpg",
    kind: "img",
    language: {
      code: "zh-CN",
      name: "中文 / English"
    },
    status: "ready"
  }, {
    id: "f7",
    name: "Bank statement.pdf",
    kind: "pdf",
    language: "zh-CN",
    status: "waiting"
  }]
}, {
  id: "s5",
  name: "Sources and caveats",
  children: [{
    id: "f8",
    name: "Official sources for this pack",
    kind: "link",
    language: "zh-CN",
    status: "ready"
  }]
}];
const HOME_TEXT = {
  "zh-CN": {
    nav: [{
      label: "支持路线"
    }, {
      label: "材料包内容"
    }, {
      label: "价格"
    }, {
      label: "常见问题"
    }],
    menu: "菜单",
    cta: "开始准备材料",
    secondaryCta: "查看支持路线",
    badge: "申根 · 英国 · 日本 · 美国 B1/B2",
    title: "更清楚地准备你的签证材料包",
    lede: "回答一组结构化问题，上传证件与银行流水。我们对照官方要求生成材料，交叉校验日期、城市与在职信息，人工复核后交给你一份可以直接打印递交的材料包。",
    trust: [{
      label: "官方来源核对",
      icon: "book-open-text"
    }, {
      label: "材料自动生成",
      icon: "file-text"
    }, {
      label: "一致性校验",
      icon: "git-compare-arrows"
    }, {
      label: "人工复核后交付",
      icon: "user-check"
    }],
    packHeader: "你会拿到这样一份材料包",
    packFoot: "示例：法国短期旅游签证 · 共 14 份文件",
    pack: PACK_ZH,
    howTitle: "三步，全程都能看到进度",
    steps: [{
      n: "1",
      t: "回答一组问题",
      d: "一次一个问题，每题都写清楚为什么要问。填到一半可以关掉，链接还在。"
    }, {
      n: "2",
      t: "上传证件与流水",
      d: "护照、银行流水、在职材料。手机可以连拍多页，中断了会从断点继续。"
    }, {
      n: "3",
      t: "拿到可打印的材料包",
      d: "机器生成、交叉校验，再由人工复核一遍，最后交给你一份可以直接打印的文件夹。"
    }],
    consistencyTitle: "被拒的常见原因，是材料之间对不上",
    consistencyBody: "在职证明写的入职日期和社保记录差两个月；机票订的是巴黎，酒店订在里昂。这些不是大错，但需要在递交前解释清楚。我们把材料之间的每一处出入列出来，并写明该怎么处理。",
    consistencyNote: "校验只做对照，不替你判断真伪，也不会修改你上传的原件。",
    consistencySummary: "示例：共检查 42 项，2 项需要确认。",
    checks: [{
      id: "c1",
      field: "在职起始日期",
      severity: "conflict",
      readings: [{
        source: "在职证明",
        value: "2021-03-01"
      }, {
        source: "社保记录",
        value: "2021-05-01"
      }],
      action: "两处日期不一致。请以社保记录为准，或让公司出具一份更正说明。"
    }, {
      id: "c2",
      field: "出行城市",
      severity: "check",
      readings: [{
        source: "机票预订",
        value: "巴黎 CDG"
      }, {
        source: "住宿预订",
        value: "里昂"
      }],
      action: "行程里没有说明从巴黎去里昂的方式。补一张火车票或在行程说明里写清楚。"
    }, {
      id: "c3",
      field: "护照有效期",
      severity: "pass",
      readings: [{
        source: "护照资料页",
        value: "2031-04-18"
      }, {
        source: "计划返程",
        value: "2026-09-14"
      }]
    }],
    sourcesTitle: "每一条要求，都写清楚出处",
    sourcesBody: "材料包里每一份文件都附上依据的官方页面和核对日期。我们也会写明哪些事我们不做：不代办、不承诺结果、不替你联系使领馆。",
    sources: [{
      title: "法国驻华使馆 · 短期签证材料清单",
      publisher: "France-Visas",
      url: "france-visas.gouv.fr",
      quote: "银行对账单需覆盖最近三个月。"
    }, {
      title: "申根签证通用要求",
      publisher: "European Commission",
      url: "ec.europa.eu"
    }],
    caveats: ["最终是否受理与批准由使领馆决定，本服务不代办、不承诺结果。", "官方要求可能随时调整，交付前我们会再核对一次。"],
    ctaTitle: "先看看需要准备什么，再决定",
    ctaBody: "前面的问题不收费，看到完整清单后再付款。",
    footerNote: "本服务不代办签证，也不影响使领馆的审批结果。",
    footerCols: [{
      title: "服务",
      links: ["申根签证", "英国签证", "日本签证", "美国 B1/B2"]
    }, {
      title: "材料包",
      links: ["包含哪些文件", "一致性校验", "人工复核", "退款说明"]
    }, {
      title: "帮助",
      links: ["常见问题", "联系我们", "隐私与数据"]
    }]
  },
  en: {
    nav: [{
      label: "Supported routes"
    }, {
      label: "What's in the pack"
    }, {
      label: "Pricing"
    }, {
      label: "Common questions"
    }],
    menu: "Menu",
    cta: "Start preparing my documents",
    secondaryCta: "See supported routes",
    badge: "Schengen · UK · Japan · US B1/B2",
    title: "Prepare your visa document pack with less guesswork",
    lede: "Answer a structured set of questions and upload your passport and bank statement. We build the documents against the official requirements, cross-check dates, cities and employment details, and hand you a human-reviewed pack you can print and submit as it is.",
    trust: [{
      label: "Checked against official sources",
      icon: "book-open-text"
    }, {
      label: "Documents generated for you",
      icon: "file-text"
    }, {
      label: "Cross-document consistency check",
      icon: "git-compare-arrows"
    }, {
      label: "Delivered after human review",
      icon: "user-check"
    }],
    packHeader: "This is the pack you receive",
    packFoot: "Example: French short-stay tourist visa · 14 documents",
    pack: PACK_EN,
    howTitle: "Three steps, and you can see the progress the whole way",
    steps: [{
      n: "1",
      t: "Answer a set of questions",
      d: "One question at a time, each explaining why it is being asked. Stop halfway and the link back keeps working."
    }, {
      n: "2",
      t: "Upload documents and statements",
      d: "Passport, bank statement, employment paperwork. On a phone you can photograph several pages in a row, and an interrupted upload resumes."
    }, {
      n: "3",
      t: "Receive a pack you can print",
      d: "Generated, cross-checked, then reviewed by a person before you get a folder that is ready to print."
    }],
    consistencyTitle: "Most refusals come from documents that disagree with each other",
    consistencyBody: "The employment letter says one start date and the social-insurance record says another, two months apart. The flight lands in Paris and the hotel is in Lyon. None of this is serious, but it has to be explained before you submit. We list every disagreement between your documents and say what to do about each one.",
    consistencyNote: "The check compares documents. It does not judge whether they are genuine, and it never edits the originals you uploaded.",
    consistencySummary: "Example: 42 items checked, 2 need confirming.",
    checks: [{
      id: "c1",
      field: "Employment start date",
      severity: "conflict",
      readings: [{
        source: "Employment letter",
        value: "2021-03-01"
      }, {
        source: "Social insurance record",
        value: "2021-05-01"
      }],
      action: "The two dates disagree. Use the social-insurance date, or ask your employer for a short correction letter."
    }, {
      id: "c2",
      field: "Destination city",
      severity: "check",
      readings: [{
        source: "Flight booking",
        value: "Paris CDG"
      }, {
        source: "Accommodation",
        value: "Lyon"
      }],
      action: "Your itinerary does not say how you travel from Paris to Lyon. Add a train ticket, or explain it in the itinerary statement."
    }, {
      id: "c3",
      field: "Passport validity",
      severity: "pass",
      readings: [{
        source: "Passport data page",
        value: "2031-04-18"
      }, {
        source: "Planned return",
        value: "2026-09-14"
      }]
    }],
    sourcesTitle: "Every requirement says where it came from",
    sourcesBody: "Each document in the pack carries the official page it is based on and the date we checked it. We also write down what we do not do: we are not an agency, we make no promise about the outcome, and we never contact the consulate for you.",
    sources: [{
      title: "French Embassy in China · short-stay document list",
      publisher: "France-Visas",
      url: "france-visas.gouv.fr",
      quote: "Bank statements must cover the last three months."
    }, {
      title: "General Schengen visa requirements",
      publisher: "European Commission",
      url: "ec.europa.eu"
    }],
    caveats: ["The consulate decides whether to accept and approve your application. We are not an agency and promise no outcome.", "Official requirements can change at any time. We check them again before we deliver."],
    ctaTitle: "See what you need to prepare, then decide",
    ctaBody: "The questions are free. You pay after you have seen the full list.",
    footerNote: "We are not a visa agency, and we have no influence on the consulate's decision.",
    footerCols: [{
      title: "Services",
      links: ["Schengen visa", "UK visa", "Japan visa", "US B1/B2"]
    }, {
      title: "The pack",
      links: ["What is included", "Consistency check", "Human review", "Refunds"]
    }, {
      title: "Help",
      links: ["Common questions", "Contact us", "Privacy and data"]
    }]
  }
};
Object.assign(window, {
  HOME_TEXT
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/copy.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Locale = __ds_scope.Locale;

__ds_ns.ICON_SVG = __ds_scope.ICON_SVG;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.LANGUAGE_NAMES = __ds_scope.LANGUAGE_NAMES;

__ds_ns.LOCALES = __ds_scope.LOCALES;

__ds_ns.CATALOGUE = __ds_scope.CATALOGUE;

__ds_ns.DeviceHandoff = __ds_scope.DeviceHandoff;

__ds_ns.SaveResumeNotice = __ds_scope.SaveResumeNotice;

__ds_ns.Sheet = __ds_scope.Sheet;

__ds_ns.WeChatEscape = __ds_scope.WeChatEscape;

__ds_ns.CheckboxGroup = __ds_scope.CheckboxGroup;

__ds_ns.ChoiceRow = __ds_scope.ChoiceRow;

__ds_ns.DateInput = __ds_scope.DateInput;

__ds_ns.ErrorSummary = __ds_scope.ErrorSummary;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Question = __ds_scope.Question;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.BackLink = __ds_scope.BackLink;

__ds_ns.LanguageSwitcher = __ds_scope.LanguageSwitcher;

__ds_ns.PIPELINE_STAGES = __ds_scope.PIPELINE_STAGES;

__ds_ns.PipelineProgress = __ds_scope.PipelineProgress;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

__ds_ns.StepProgress = __ds_scope.StepProgress;

__ds_ns.StickyActionBar = __ds_scope.StickyActionBar;

__ds_ns.TaskList = __ds_scope.TaskList;

__ds_ns.CameraCaptureLoop = __ds_scope.CameraCaptureLoop;

__ds_ns.CitationPanel = __ds_scope.CitationPanel;

__ds_ns.ConsistencyReport = __ds_scope.ConsistencyReport;

__ds_ns.FilePreview = __ds_scope.FilePreview;

__ds_ns.PackFileTree = __ds_scope.PackFileTree;

__ds_ns.ResumableUploader = __ds_scope.ResumableUploader;

__ds_ns.TrustRow = __ds_scope.TrustRow;

__ds_ns.UploadChecklist = __ds_scope.UploadChecklist;

__ds_ns.t = __ds_scope.t;

__ds_ns.has = __ds_scope.has;

})();
