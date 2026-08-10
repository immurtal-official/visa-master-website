/**
 * Copy discipline, enforced before the build.
 *
 * Two ways for a user-facing string to go wrong are cheap to make and
 * expensive to find: a key translated into one catalogue and forgotten in the
 * other, and a sentence typed straight into a component. Both stay invisible
 * until someone reading the other language hits them. This fails the build on
 * either, plus the smaller ways a catalogue drifts.
 *
 * Run through tsx, which is what lets it import the message-key registry from
 * packages/core as TypeScript source.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@formatjs/icu-messageformat-parser";
import { MESSAGE_KEYS } from "../packages/core/src/i18n/message-keys.ts";
import { LOCALES } from "../packages/core/src/i18n/locales.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MESSAGES_DIR = join(ROOT, "apps/web/messages");
const SOURCE_DIR = join(ROOT, "apps/web/src");

/**
 * Han, its extensions, compatibility ideographs, CJK punctuation and fullwidth
 * forms. Fullwidth matters as much as the ideographs: a lone ， in a component
 * is a sentence that started life in the catalogue.
 */
const CJK = /[㐀-䶿一-鿿豈-﫿　-〿＀-￯]/;

const failures = [];
const fail = (where, message) => failures.push({ where, message });

function readCatalogue(locale) {
  const path = join(MESSAGES_DIR, `${locale}.json`);
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`messages/${locale}.json`, `cannot be read or parsed: ${error.message}`);
    return null;
  }
}

/** Flatten `{a: {b: "x"}}` to `{"a.b": "x"}` — the shape keys are written in. */
function flatten(node, prefix = "", out = new Map()) {
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) flatten(value, path, out);
    else out.set(path, value);
  }
  return out;
}

/** ICU argument names used by a message, including inside plural branches. */
function argumentsOf(ast, found = new Set()) {
  for (const node of ast) {
    if (node.value !== undefined && node.type !== 0) found.add(node.value);
    if (node.options) {
      for (const option of Object.values(node.options)) argumentsOf(option.value, found);
    }
    if (node.children) argumentsOf(node.children, found);
  }
  return found;
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) files.push(path);
  }
  return files;
}

// ---------------------------------------------------------------------------

const catalogues = new Map();
for (const locale of LOCALES) {
  const catalogue = readCatalogue(locale);
  if (catalogue) catalogues.set(locale, flatten(catalogue));
}

if (catalogues.size === LOCALES.length) {
  const [reference, ...others] = LOCALES;
  const referenceKeys = new Set(catalogues.get(reference).keys());

  // 1. Parity — a key in one catalogue and not the other.
  for (const locale of others) {
    const keys = new Set(catalogues.get(locale).keys());
    for (const key of referenceKeys) {
      if (!keys.has(key)) fail(`messages/${locale}.json`, `missing key: ${key}`);
    }
    for (const key of keys) {
      if (!referenceKeys.has(key)) {
        fail(`messages/${reference}.json`, `missing key present in ${locale}: ${key}`);
      }
    }
  }

  const argumentsByKey = new Map();

  for (const locale of LOCALES) {
    for (const [key, message] of catalogues.get(locale)) {
      // 5. Empty values — a key that resolves to nothing renders as nothing.
      if (typeof message !== "string" || message.trim() === "") {
        fail(`messages/${locale}.json`, `empty or non-string message: ${key}`);
        continue;
      }

      // 2. ICU validity.
      let names;
      try {
        names = argumentsOf(parse(message));
      } catch (error) {
        fail(`messages/${locale}.json`, `invalid ICU message for ${key}: ${error.message}`);
        continue;
      }

      // 3. Argument parity — {email} in one language, dropped in the other.
      const seen = argumentsByKey.get(key);
      if (!seen) {
        argumentsByKey.set(key, { locale, names });
      } else {
        const missing = [...seen.names].filter((name) => !names.has(name));
        const extra = [...names].filter((name) => !seen.names.has(name));
        if (missing.length || extra.length) {
          fail(
            `messages/${locale}.json`,
            `arguments differ from ${seen.locale} for ${key}: ` +
              `${missing.length ? `missing {${missing.join("}, {")}}` : ""}` +
              `${missing.length && extra.length ? "; " : ""}` +
              `${extra.length ? `unexpected {${extra.join("}, {")}}` : ""}`,
          );
        }
      }
    }
  }

  // 4. Core coverage — every key a validation rule can emit must resolve, in
  //    every locale, with the parameters the registry declares for it.
  for (const [key, params] of Object.entries(MESSAGE_KEYS)) {
    for (const locale of LOCALES) {
      const message = catalogues.get(locale).get(key);
      if (typeof message !== "string" || message.trim() === "") {
        fail(`messages/${locale}.json`, `missing key declared in packages/core: ${key}`);
        continue;
      }
      const names = argumentsByKey.get(key)?.names ?? new Set();
      for (const param of params) {
        if (!names.has(param)) {
          fail(
            `messages/${locale}.json`,
            `${key} does not use the {${param}} parameter its rule supplies`,
          );
        }
      }
    }
  }
}

// 6. No user-facing Chinese in components. Copy belongs in the catalogue, and
//    a literal here is a string the other language will never receive.
for (const file of walk(SOURCE_DIR)) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return;
    if (line.includes("i18n-exempt")) return;
    if (CJK.test(line)) {
      fail(
        `${relative(ROOT, file)}:${index + 1}`,
        `Chinese text outside the catalogue: ${trimmed}`,
      );
    }
  });
}

// ---------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`check-i18n: ${failures.length} problem(s)\n`);
  for (const { where, message } of failures) console.error(`  ${where}\n    ${message}`);
  console.error("\nEvery user-facing string lives in messages/, in both locales.");
  process.exit(1);
}

console.log(`check-i18n: ${LOCALES.length} locales, catalogues agree, no copy outside them.`);
