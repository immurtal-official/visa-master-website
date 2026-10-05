#!/usr/bin/env node
/**
 * Writes the table of contents into the long documents in doc/.
 *
 *   node scripts/doc-reader/toc.mjs           # rewrite every document
 *   node scripts/doc-reader/toc.mjs --check   # fail if any is out of date
 *
 * The block is fenced by <!-- toc --> … <!-- /toc -->, which GitHub renders as
 * nothing and the reader build strips (the HTML has a sidebar instead). Anchors
 * are GitHub's, because the Markdown file is read on GitHub; the reader
 * generator has its own, older, scheme for the ids inside the HTML.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Lexer } from "marked";
import GithubSlugger from "github-slugger";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOC = path.resolve(HERE, "..", "..", "doc");

const FILES = [
  { file: "architecture-v0.4-en.md", heading: "Contents", maxDepth: 3 },
  { file: "architecture-v0.4-zh.md", heading: "目录", maxDepth: 3 },
  { file: "platform-and-dev-plan-v2-en.md", heading: "Contents", maxDepth: 3 },
  { file: "platform-and-dev-plan-v2-zh.md", heading: "目录", maxDepth: 3 },
];

const FENCE = /<!-- toc -->[\s\S]*?<!-- \/toc -->/;

function plainText(tokens) {
  let out = "";
  for (const t of tokens ?? []) {
    if (t.type === "text" || t.type === "codespan" || t.type === "escape") out += t.text;
    else if (t.tokens) out += plainText(t.tokens);
    else if (t.text) out += t.text;
  }
  return out;
}

function buildToc(markdown, { heading, maxDepth }) {
  // Without this the block's own `## Contents` heading would list itself, and
  // would shift every slug the slugger hands out after it.
  markdown = markdown.replace(FENCE, "");
  const slugger = new GithubSlugger();
  const lines = [];
  let seenTitle = false;
  let minDepth = Infinity;

  const headings = [];
  for (const token of Lexer.lex(markdown)) {
    if (token.type !== "heading") continue;
    const text = plainText(token.tokens);
    const slug = slugger.slug(text); // every heading consumes a slug, TOC'd or not
    if (!seenTitle && token.depth === 1) {
      seenTitle = true; // the document title is not an entry in its own contents
      continue;
    }
    if (token.depth > maxDepth) continue;
    headings.push({ depth: token.depth, text, slug });
    minDepth = Math.min(minDepth, token.depth);
  }

  for (const h of headings) {
    lines.push(`${"  ".repeat(h.depth - minDepth)}- [${h.text}](#${h.slug})`);
  }
  return `<!-- toc -->\n## ${heading}\n\n${lines.join("\n")}\n<!-- /toc -->`;
}

/** Puts a new block just above the first heading below the title. */
function insert(markdown, block) {
  if (FENCE.test(markdown)) return markdown.replace(FENCE, block);
  const lines = markdown.split("\n");
  let seenTitle = false;
  for (let i = 0; i < lines.length; i++) {
    if (!/^#{1,3} /.test(lines[i])) continue;
    if (!seenTitle) {
      seenTitle = true;
      continue;
    }
    // Back up over the blank line and any `---` rule that introduces the section.
    let at = i;
    while (at > 0 && lines[at - 1].trim() === "") at--;
    return [...lines.slice(0, at), "", block, ...lines.slice(at)].join("\n");
  }
  throw new Error("no place to put a table of contents: fewer than two headings");
}

const check = process.argv.includes("--check");
let stale = 0;

for (const spec of FILES) {
  const file = path.join(DOC, spec.file);
  const before = await readFile(file, "utf8");
  const after = insert(before, buildToc(before, spec));
  if (before === after) {
    console.log(`  ${spec.file} — up to date`);
    continue;
  }
  if (check) {
    console.error(`  ${spec.file} — table of contents is out of date`);
    stale++;
    continue;
  }
  await writeFile(file, after);
  console.log(`  ${spec.file} — table of contents written`);
}

if (stale) {
  console.error(`\n${stale} file(s) out of date. Run: pnpm doc:toc`);
  process.exit(1);
}
