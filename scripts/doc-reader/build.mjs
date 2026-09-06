#!/usr/bin/env node
/**
 * Builds the standalone HTML readers in doc/ from their Markdown sources.
 *
 * Each reader is one file with no network dependency: the shell stylesheet and
 * behaviour from this directory are inlined, and the diagrams come from the
 * SVGs committed under doc/diagrams/. Opening the file over file:// has to
 * work, because that is how these documents get read.
 *
 *   pnpm doc:html                                # all documents
 *   node scripts/doc-reader/build.mjs --check    # fail if any reader is stale
 *   node scripts/doc-reader/build.mjs arch-zh    # one, by key
 *
 * Nothing here needs a browser. When a mermaid block changes, this build stops
 * and tells you to run `pnpm doc:diagrams`, which is the half that does.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Marked, Renderer } from "marked";
import { DOC, DOCS, HERE, mermaidSources, readManifest, sourceHash, svgPath } from "./docs.mjs";

/** Markdown sources that exist as readers: links between them get repointed. */
const AS_HTML = new Map(DOCS.map((d) => [d.src, d.out]));

/* --------------------------------------------------------------- strings -- */

/**
 * Everything the shell says out loud. The generator emits the table for the
 * document's language as `window.__DOC_UI`; shell.js falls back to the English
 * literal for any key that is missing.
 */
const STRINGS = {
  en: {
    skip: "Skip to content",
    nav_toggle: "Toggle navigation",
    filter: "Filter sections",
    theme_toggle: "Toggle colour theme",
    toc: "Table of contents",
    contents: "Contents",
    to_top: "Back to top",
    permalink: "Permalink",
    copy: "Copy",
    copied: "Copied",
    theme_auto: "system",
    theme_light: "light",
    theme_dark: "dark",
    theme_aria: "Colour theme: {label}. Click to change.",
    theme_title: "Theme: {label}",
    toc_empty: "No sections match “{query}”",
    table_scrollable: "Scrollable table",
    lightbox_aria: "Enlarged diagram",
    zoom_in: "Zoom in",
    zoom_out: "Zoom out",
    zoom_fit: "Fit",
    close_esc: "Close (Esc)",
    diagram: "Diagram",
    diagram_width: "{px}px wide",
    enlarge: "Enlarge",
    enlarge_aria: "Enlarge diagram",
    diagram_hint: "↔ scroll · click to enlarge",
  },
  "zh-Hans": {
    skip: "跳到正文",
    nav_toggle: "切换目录",
    filter: "筛选章节",
    theme_toggle: "切换配色主题",
    toc: "目录",
    contents: "目录",
    to_top: "回到顶部",
    permalink: "本节链接",
    copy: "复制",
    copied: "已复制",
    theme_auto: "跟随系统",
    theme_light: "浅色",
    theme_dark: "深色",
    theme_aria: "配色主题：{label}。点击切换。",
    theme_title: "主题：{label}",
    toc_empty: "没有匹配“{query}”的章节",
    table_scrollable: "可横向滚动的表格",
    lightbox_aria: "放大后的图",
    zoom_in: "放大",
    zoom_out: "缩小",
    zoom_fit: "适应宽度",
    close_esc: "关闭（Esc）",
    diagram: "图",
    diagram_width: "宽 {px}px",
    enlarge: "放大",
    enlarge_aria: "放大此图",
    diagram_hint: "↔ 可横向滚动 · 点击放大",
  },
};

/* ----------------------------------------------------------------- slugs -- */

/**
 * Heading ids, matching the ids the first generation of these readers emitted:
 * lower-cased, everything that is not a letter or a digit dropped, runs of
 * whitespace collapsed to a single hyphen. Unicode-aware, so the Chinese
 * headings keep their characters instead of collapsing to empty strings.
 *
 * This is deliberately *not* GitHub's algorithm — GitHub keeps underscores and
 * emits doubled hyphens around an em dash. The Markdown files carry their own
 * table of contents written against GitHub's anchors; the generator strips it
 * (see TOC_FENCE) because the reader has a sidebar instead.
 */
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

const TOC_FENCE = /^<!-- toc -->[\s\S]*?^<!-- \/toc -->[ \t]*\r?\n?/m;
const CONTENTS_SLOT = "<!--contents-->";

/* -------------------------------------------------------------- markdown -- */

function escapeHtml(s) {
  return s
    .replace(/&(?!#?\w+;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function plainText(tokens) {
  let out = "";
  for (const t of tokens ?? []) {
    if (t.type === "text" || t.type === "codespan" || t.type === "escape") out += t.text;
    else if (t.tokens) out += plainText(t.tokens);
    else if (t.text) out += t.text;
  }
  return out;
}

/**
 * Renders one document's body. Returns the article HTML with a placeholder in
 * place of each mermaid figure, the sidebar entries, and the diagram sources
 * keyed by the id they will carry in the page.
 */
function renderBody(markdown, { mermaidPrefix, strings }) {
  const toc = []; // the sidebar: h2-h4, the working navigation
  const headings = []; // everything, for the in-page contents
  const diagrams = mermaidSources(markdown, mermaidPrefix);
  let nextDiagram = 0;
  const seen = new Map();
  const base = new Renderer();

  const renderer = {
    heading(token) {
      const depth = token.depth;
      const inner = this.parser.parseInline(token.tokens);
      let id = slugify(plainText(token.tokens)) || `section-${seen.size + 1}`;
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      if (n) id = `${id}-${n}`;
      // The sidebar carries plain text: inline code and emphasis add noise at
      // that size, and the filter box matches against what is displayed.
      const label = escapeHtml(plainText(token.tokens));
      headings.push({ depth, id, label });
      if (depth >= 2 && depth <= 4) toc.push({ depth, id, label });
      const anchor = `<a class="hd__anchor" href="#${id}" aria-label="${escapeHtml(strings.permalink)}">#</a>`;
      return `<h${depth} id="${id}" class="hd">${inner}${anchor}</h${depth}>\n`;
    },

    code(token) {
      const lang = (token.lang || "text").trim().split(/\s+/)[0];
      if (lang === "mermaid") {
        // The cache is keyed by position, so the order the renderer meets the
        // blocks in has to be the order mermaidSources() listed them in. It is
        // — but a silent mismatch would embed the wrong picture, so say so.
        const expected = diagrams[nextDiagram++];
        if (!expected || expected.source !== token.text) {
          throw new Error(`diagram ${nextDiagram - 1} of ${mermaidPrefix} is not where it was`);
        }
        return `<!--diagram:${expected.id}-->\n`;
      }
      const bar =
        `<div class="codeblock__bar"><span class="codeblock__lang">${escapeHtml(lang)}</span>` +
        `<button class="codeblock__copy" type="button">${escapeHtml(strings.copy)}</button></div>`;
      return (
        `<div class="codeblock" data-lang="${escapeHtml(lang)}">${bar}` +
        `<pre><code class="language-${escapeHtml(lang)}">${escapeHtml(token.text)}\n</code></pre></div>\n`
      );
    },

    table(token) {
      return `<div class="tablewrap">${base.table.call(this, token)}</div>\n`;
    },

    blockquote(token) {
      const html = base.blockquote.call(this, token);
      return html.replace(/^<blockquote>/, '<blockquote class="note">');
    },

    hr() {
      return '<hr class="rule">\n';
    },

    link(token) {
      const out = base.link.call(this, token);
      return out.replace(/href="([^"]*)"/, (m, href) => {
        const [file, hash = ""] = href.split("#");
        const mapped = AS_HTML.get(file);
        return mapped ? `href="${mapped}${hash ? "#" + hash : ""}"` : m;
      });
    },
  };

  const parser = new Marked({ gfm: true, renderer });
  let html = parser.parse(markdown.replace(TOC_FENCE, `\n${CONTENTS_SLOT}\n`));
  if (html.includes(CONTENTS_SLOT)) {
    html = html.replace(CONTENTS_SLOT, renderContents(headings, strings));
  }
  return { html, toc, diagrams };
}

/**
 * The document's own table of contents, in the place its Markdown source puts
 * it — h1-h3, the same slice the `<!-- toc -->` block carries, and the same
 * omission of the document title.
 *
 * The sidebar is not a substitute for it: the sidebar hides behind a button on
 * a narrow screen, is absent from print, and is navigation rather than part of
 * the document. This is the shape of the thing, read once at the top.
 */
function renderContents(headings, strings) {
  let title = true;
  const entries = headings.filter((h) => {
    if (title && h.depth === 1) {
      title = false;
      return false;
    }
    return h.depth <= 3;
  });
  if (!entries.length) return "";
  const top = Math.min(...entries.map((h) => h.depth));
  const items = entries
    .map(
      (h) =>
        `  <li class="contents__item contents__item--d${h.depth - top + 1}">` +
        `<a class="contents__link" href="#${h.id}">${h.label}</a></li>`,
    )
    .join("\n");
  return (
    `<nav class="contents" aria-labelledby="contents-title">\n` +
    `<h2 class="contents__title" id="contents-title">${escapeHtml(strings.contents)}</h2>\n` +
    `<ol class="contents__list">\n${items}\n</ol>\n</nav>`
  );
}

/* -------------------------------------------------------------- diagrams -- */

/**
 * The committed SVGs, checked against the mermaid they were rendered from.
 *
 * A cache that can silently go stale is worse than no cache: the page would
 * keep showing last year's picture and nothing would say so. So the manifest
 * carries a hash of each source, and a mismatch stops the build rather than
 * producing a plausible wrong page.
 */
async function loadDiagrams(jobs) {
  const manifest = await readManifest();
  const svgs = new Map();
  const stale = [];

  for (const { id, source } of jobs) {
    const hash = sourceHash(source);
    if (manifest[id]?.sha256 !== hash) {
      stale.push(`${id} — the mermaid source changed since it was rendered`);
      continue;
    }
    try {
      svgs.set(id, (await readFile(svgPath(id), "utf8")).trim());
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
      stale.push(`${id} — doc/diagrams/${id}.svg is missing`);
    }
  }

  if (stale.length) {
    console.error("Diagrams are out of date:\n" + stale.map((l) => `  ${l}`).join("\n"));
    console.error("\nRun: pnpm doc:diagrams");
    process.exit(1);
  }
  return svgs;
}

/* -------------------------------------------------------------- assembly -- */

function renderToc(entries) {
  return entries
    .map(
      (e) =>
        `  <li class="toc__item toc__item--h${e.depth}"><a class="toc__link" href="#${e.id}">${e.label}</a></li>`,
    )
    .join("\n");
}

const ICON_MENU =
  '<svg class="ico ico--menu" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 4h12M2 8h12M2 12h12"/></svg>';
const ICON_CLOSE =
  '<svg class="ico ico--close" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>';
const ICON_AUTO =
  '<svg class="ico ico--auto" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="8" cy="8" r="5.25"/><path d="M8 2.75v10.5a5.25 5.25 0 000-10.5z" fill="currentColor" stroke="none"/></svg>';
const ICON_LIGHT =
  '<svg class="ico ico--light" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="3.1"/><path d="M8 1.2v1.6M8 13.2v1.6M14.8 8h-1.6M2.8 8H1.2M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1M12.8 12.8l-1.1-1.1M4.3 4.3L3.2 3.2"/></svg>';
const ICON_DARK =
  '<svg class="ico ico--dark" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="M13.4 9.6A5.6 5.6 0 016.4 2.6a5.75 5.75 0 107 7z"/></svg>';
const ICON_TOP =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V3.5M3.75 7.75L8 3.5l4.25 4.25"/></svg>';

function assemble(meta, { css, js, body, toc, strings }) {
  const s = (k) => escapeHtml(strings[k]);
  const topbarLinks = [meta.twin, meta.sibling]
    .filter(Boolean)
    .map(
      (l, i) =>
        `    <a class="topbar__link"${i === 1 ? ' id="sibling-link"' : ""} href="${l.href}">${escapeHtml(l.label)}</a>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${meta.lang}" data-theme-mode="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(meta.title)} · ${escapeHtml(meta.badge)}</title>
<style>
${css}</style>
<script>
window.__DOC_UI = ${JSON.stringify(strings)};
</script>
<script>
${js}</script>
</head>
<body data-doc="${meta.doc}">
  <a class="skip-link" href="#main">${s("skip")}</a>
  <header class="topbar">
    <button class="icon-btn" id="nav-toggle" aria-label="${s("nav_toggle")}" aria-expanded="false">${ICON_MENU}${ICON_CLOSE}</button>
    <span class="topbar__title">${escapeHtml(meta.title)}</span>
    <span class="topbar__badge">${escapeHtml(meta.badge)}</span>
    <div class="topbar__spacer"></div>
    <input id="toc-search" class="search" type="search" placeholder="${s("filter")}" aria-label="${s("filter")}">
${topbarLinks}
    <button class="icon-btn" id="theme-toggle" aria-label="${s("theme_toggle")}">${ICON_AUTO}${ICON_LIGHT}${ICON_DARK}</button>
  </header>
  <div class="layout">
    <nav class="sidebar" id="sidebar" aria-label="${s("toc")}"><ol class="toc">
${toc}
</ol>
</nav>
    <main class="content" id="main"><article class="prose">${body}</article></main>
  </div>
  <button id="to-top" class="to-top" aria-label="${s("to_top")}">${ICON_TOP}</button>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ main -- */

const argv = process.argv.slice(2);
const check = argv.includes("--check");
const wanted = argv.filter((a) => !a.startsWith("-"));
const targets = wanted.length ? DOCS.filter((d) => wanted.includes(d.key)) : DOCS;
if (!targets.length) {
  console.error(`Unknown document. Known keys: ${DOCS.map((d) => d.key).join(", ")}`);
  process.exit(1);
}

const css = await readFile(path.join(HERE, "shell.css"), "utf8");
const js = await readFile(path.join(HERE, "shell.js"), "utf8");

const built = [];
for (const meta of targets) {
  const strings = STRINGS[meta.lang] ?? STRINGS.en;
  const markdown = await readFile(path.join(DOC, meta.src), "utf8");
  const { html, toc, diagrams } = renderBody(markdown, {
    mermaidPrefix: meta.mermaidPrefix,
    strings,
  });
  built.push({ meta, strings, html, toc, diagrams });
  if (!check) {
    console.log(
      `  ${meta.src} → ${meta.out}  (${toc.length} sections, ${diagrams.length} diagrams)`,
    );
  }
}

const svgs = await loadDiagrams(built.flatMap((b) => b.diagrams));

const stale = [];

for (const { meta, strings, html, toc, diagrams } of built) {
  let body = html;
  for (const { id } of diagrams) {
    const svg = svgs.get(id);
    body = body.replace(
      `<!--diagram:${id}-->`,
      `<figure class="diagram" data-mermaid="${id}">${svg}</figure>`,
    );
  }
  const page = assemble(meta, { css, js, body, toc: renderToc(toc), strings });
  const out = path.join(DOC, meta.out);

  if (check) {
    let current = null;
    try {
      current = await readFile(out, "utf8");
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
    }
    if (current !== page) stale.push(meta.out + (current === null ? " — missing" : ""));
    continue;
  }

  await writeFile(out, page);
  console.log(`  wrote doc/${meta.out}  (${(page.length / 1024).toFixed(0)} KB)`);
}

if (check) {
  if (stale.length) {
    console.error("Readers are out of date:\n" + stale.map((l) => `  ${l}`).join("\n"));
    console.error("\nRun: pnpm doc:html");
    process.exit(1);
  }
  console.log(`  ${targets.length} reader${targets.length === 1 ? "" : "s"}, all current`);
}
