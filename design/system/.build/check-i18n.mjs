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
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join, relative, sep } = await import("node:path");
  const { pathToFileURL } = await import("node:url");


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
      if (statSync(p).isDirectory()) walk(p, out);
      else if (/\.(jsx?|tsx?)$/.test(name) && !/\.d\.ts$/.test(name) && !SKIP.has(name)) out.push(p);
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
      if (c === "/" && src[i + 1] === "/") { const j = src.indexOf("\n", i); const e = j < 0 ? src.length : j; out += src.slice(i, e).replace(/[^\n]/g, " "); i = e; continue; }
      if (c === "/" && src[i + 1] === "*") { const j = src.indexOf("*/", i + 2); const e = j < 0 ? src.length : j + 2; out += src.slice(i, e).replace(/[^\n]/g, " "); i = e; continue; }
      if (c === '"' || c === "'" || c === "`") {
        const start = i; const q = c; i++;
        while (i < src.length) {
          if (src[i] === "\\") { i += 2; continue; }
          if (src[i] === q) { i++; break; }
          if (q === "`" && src[i] === "$" && src[i + 1] === "{") { let d = 1; i += 2; while (i < src.length && d > 0) { if (src[i] === "{") d++; else if (src[i] === "}") d--; i++; } continue; }
          i++;
        }
        const text = src.slice(start, i);
        literals.push({ index: start, text });
        out += text.replace(/[^\n]/g, " ");
        continue;
      }
      out += c; i++;
    }
    return { blanked: out, literals };
  }

  const lineOf = (src, idx) => src.slice(0, idx).split("\n").length;
  const exempt = (src, idx) => /i18n-exempt/.test(src.split("\n")[lineOf(src, idx) - 1]);

  for (const file of walk(SCAN_DIR)) {
    const rel = relative(ROOT, file).split(sep).join("/");
    const src = readFileSync(file, "utf8");
    const { blanked, literals } = scan(src);
    const at = (idx) => `${rel}:${lineOf(src, idx)}`;

    for (const { index, text } of literals) {
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

  const { CATALOGUE, LOCALES } = await import(pathToFileURL(join(ROOT, "components/core/strings.js")).href);
  const placeholders = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
  const base = LOCALES[0];
  const allKeys = new Set(LOCALES.flatMap((l) => Object.keys(CATALOGUE[l] || {})));

  for (const key of [...allKeys].sort()) {
    for (const loc of LOCALES) {
      const v = (CATALOGUE[loc] || {})[key];
      if (v === undefined) { errors.push(`strings.js  key "${key}" is missing from locale "${loc}"`); continue; }
      if (typeof v !== "string" || !v.trim()) { errors.push(`strings.js  key "${key}" is empty in locale "${loc}"`); continue; }
      if (loc !== base && CATALOGUE[base][key] && placeholders(v) !== placeholders(CATALOGUE[base][key]))
        errors.push(`strings.js  key "${key}" has different placeholders in "${loc}" (${placeholders(v) || "none"}) and "${base}" (${placeholders(CATALOGUE[base][key]) || "none"})`);
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
