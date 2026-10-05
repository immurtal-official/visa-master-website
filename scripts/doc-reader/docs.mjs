#!/usr/bin/env node
/**
 * What the doc-reader build works on: the document list, and the diagram cache
 * that `build.mjs` reads and `diagrams.mjs` writes.
 *
 * The diagrams are rendered ahead of time and committed as SVG. That keeps the
 * HTML build hermetic — no browser, no platform guessing — and it makes a change
 * to a picture reviewable as a diff instead of invisible inside a 380 KB blob.
 * The cost is that an SVG can fall behind the mermaid source it came from, so
 * the manifest records a hash of each source and `build.mjs` refuses to build
 * against a stale one.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Lexer } from "marked";

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..", "..");
export const DOC = path.join(ROOT, "doc");
export const DIAGRAMS = path.join(DOC, "diagrams");
export const MANIFEST = path.join(DIAGRAMS, "manifest.json");

/* ------------------------------------------------------------------ docs -- */

/**
 * `mermaidPrefix` becomes the SVG element id, the cached file name, and the
 * lightbox caption, so it has to stay unique per document — two readers open in
 * one browser tab is not a case we have, but duplicate ids inside one file
 * would be.
 */
export const DOCS = [
  {
    key: "arch-en",
    lang: "en",
    src: "architecture-v0.4-en.md",
    out: "architecture-v0.4-en.html",
    doc: "arch",
    mermaidPrefix: "arch",
    title: "Visa Master Platform Architecture",
    badge: "v0.4 · Architecture",
    sibling: { href: "platform-and-dev-plan-v2-en.html", label: "Platform & plan →" },
    twin: { href: "architecture-v0.4-zh.html", label: "中文" },
  },
  {
    key: "arch-zh",
    lang: "zh-Hans",
    src: "architecture-v0.4-zh.md",
    out: "architecture-v0.4-zh.html",
    doc: "arch",
    mermaidPrefix: "archzh",
    title: "Visa Master 平台架构",
    badge: "v0.4 · 架构",
    sibling: { href: "platform-and-dev-plan-v2-zh.html", label: "平台与计划 →" },
    twin: { href: "architecture-v0.4-en.html", label: "English" },
  },
  {
    key: "plan-en",
    lang: "en",
    src: "platform-and-dev-plan-v2-en.md",
    out: "platform-and-dev-plan-v2-en.html",
    doc: "plat",
    mermaidPrefix: "plat",
    title: "Platform Selection & Development Plan",
    badge: "v2 · Platform & Plan",
    sibling: { href: "architecture-v0.4-en.html", label: "← Architecture" },
    twin: { href: "platform-and-dev-plan-v2-zh.html", label: "中文" },
  },
  {
    key: "plan-zh",
    lang: "zh-Hans",
    src: "platform-and-dev-plan-v2-zh.md",
    out: "platform-and-dev-plan-v2-zh.html",
    doc: "plat",
    mermaidPrefix: "platzh",
    title: "平台选型与开发计划",
    badge: "v2 · 平台与计划",
    sibling: { href: "architecture-v0.4-zh.html", label: "← 架构" },
    twin: { href: "platform-and-dev-plan-v2-en.html", label: "English" },
  },
];

/* -------------------------------------------------------------- diagrams -- */

/**
 * Every mermaid block in a document, in the order the parser meets them — the
 * same order `build.mjs` renders them in, so the numbering the two scripts
 * arrive at is the same numbering. `build.mjs` asserts that rather than
 * trusting it.
 */
export function mermaidSources(markdown, prefix) {
  const out = [];
  const walk = (tokens) => {
    for (const token of tokens ?? []) {
      if (token.type === "code" && (token.lang || "").trim().split(/\s+/)[0] === "mermaid") {
        out.push({ id: `${prefix}-${out.length}`, source: token.text });
      }
      if (token.tokens) walk(token.tokens);
      if (token.items) walk(token.items);
      if (token.rows) for (const row of token.rows) walk(row);
    }
  };
  walk(Lexer.lex(markdown));
  return out;
}

/** Short, but a sha256 prefix: this guards against forgetting, not tampering. */
export function sourceHash(source) {
  return createHash("sha256").update(source, "utf8").digest("hex").slice(0, 16);
}

export function svgPath(id) {
  return path.join(DIAGRAMS, `${id}.svg`);
}

export async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

export async function writeManifest(manifest) {
  await mkdir(DIAGRAMS, { recursive: true });
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => (a < b ? -1 : 1)));
  await writeFile(MANIFEST, JSON.stringify(ordered, null, 2) + "\n");
}
