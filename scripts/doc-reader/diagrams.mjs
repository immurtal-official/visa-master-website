#!/usr/bin/env node
/**
 * Renders the mermaid blocks in doc/ to the committed SVGs under doc/diagrams/.
 *
 *   pnpm doc:diagrams            # every diagram whose source changed
 *   pnpm doc:diagrams --all      # every diagram, changed or not
 *   pnpm doc:diagrams --check    # report staleness, render nothing
 *
 * This is the only part of the doc build that needs a browser, and the only
 * reason to install mermaid — which is why neither is a dependency of the repo.
 * Diagrams change about once a year; whoever changes one installs the tools:
 *
 *   pnpm add -w -D mermaid puppeteer-core
 *
 * Rendering uses the Chrome already on the machine rather than downloading one;
 * point CHROME_PATH at it if it lives somewhere unusual. Commit the SVGs it
 * writes together with the Markdown change, then run `pnpm doc:html`.
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import {
  DOC,
  DOCS,
  DIAGRAMS,
  ROOT,
  mermaidSources,
  readManifest,
  sourceHash,
  svgPath,
  writeManifest,
} from "./docs.mjs";

/* --------------------------------------------------------------- loading -- */

/** Both are optional: the HTML build never touches them. */
async function optional(name) {
  try {
    return await import(name);
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND") throw err;
    throw new Error(
      `${name} is not installed. Rendering diagrams needs it:\n` +
        `    pnpm add -w -D mermaid puppeteer-core\n` +
        `Nothing else in the doc build does, which is why it is not a dependency.`,
    );
  }
}

async function loadPuppeteer() {
  return (await optional("puppeteer-core")).default;
}

async function mermaidBundle() {
  await optional("mermaid"); // resolve it through node so the error is the good one
  return path.join(ROOT, "node_modules/mermaid/dist/mermaid.min.js");
}

/* ------------------------------------------------------------- rendering -- */

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

async function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      await access(candidate);
      return candidate;
    } catch {}
  }
  throw new Error(
    "No Chrome found for diagram rendering. Install Google Chrome, or set CHROME_PATH " +
      "to a Chrome/Chromium binary.",
  );
}

/**
 * Renders every diagram of every document in one browser session.
 *
 * The font stack and size are the page's own, so diagram text matches the prose
 * around it; the default mermaid theme supplies the rest, and the reader
 * stylesheet keeps the diagram panel light in both themes because these SVGs
 * are theme-unaware.
 */
async function renderDiagrams(jobs) {
  if (!jobs.length) return new Map();
  const executablePath = await findChrome();
  const puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1200, deviceScaleFactor: 1 });
    await page.setContent("<!doctype html><html><body></body></html>");
    await page.addScriptTag({ path: await mermaidBundle() });
    await page.evaluate(() => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "strict",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        fontSize: 15,
      });
    });

    const out = new Map();
    for (const { id, source } of jobs) {
      const svg = await page.evaluate(
        async (renderId, code) => (await window.mermaid.render(renderId, code)).svg,
        id,
        source,
      );
      out.set(id, postProcessSvg(svg, id));
    }
    return out;
  } finally {
    await browser.close();
  }
}

/**
 * mermaid hands back an SVG sized for the viewport it was rendered in. The
 * reader wants one that fills its column and can be zoomed, so the intrinsic
 * size moves onto data attributes (shell.js reads them to compute the minimum
 * width at which the smallest label is still legible) and the width becomes
 * fluid.
 */
function postProcessSvg(svg, id) {
  const open = svg.match(/^<svg[^>]*>/);
  if (!open) throw new Error(`mermaid returned no <svg> for ${id}`);
  let tag = open[0];
  const viewBox = tag.match(/viewBox="([^"]*)"/)?.[1] ?? "";
  const [, , w = "0", h = "0"] = viewBox.split(/\s+/);

  tag = tag
    .replace(/\s(width|height)="[^"]*"/g, "")
    .replace(/\sstyle="[^"]*"/, "")
    .replace(/^<svg/, '<svg style="background-color: transparent;"')
    .replace(
      />$/,
      ` width="100%" preserveAspectRatio="xMidYMid meet" data-diagram-id="${id}"` +
        ` data-intrinsic-width="${w}" data-intrinsic-height="${h}">`,
    );
  return tag + svg.slice(open[0].length);
}

/* ------------------------------------------------------------------ main -- */

const args = process.argv.slice(2);
const all = args.includes("--all");
const check = args.includes("--check");

const manifest = await readManifest();
const wanted = [];
const seen = new Set();

for (const meta of DOCS) {
  const markdown = await readFile(path.join(DOC, meta.src), "utf8");
  for (const { id, source } of mermaidSources(markdown, meta.mermaidPrefix)) {
    seen.add(id);
    const hash = sourceHash(source);
    let stale = all || manifest[id]?.sha256 !== hash;
    if (!stale) {
      try {
        await access(svgPath(id));
      } catch {
        stale = true;
      }
    }
    if (stale) wanted.push({ id, source, hash, doc: meta.key });
  }
}

const orphans = Object.keys(manifest).filter((id) => !seen.has(id));

if (check) {
  for (const d of wanted) console.error(`  ${d.id} — stale (${d.doc})`);
  for (const id of orphans) console.error(`  ${id} — no longer in any document`);
  if (wanted.length) {
    console.error(`\n${wanted.length} diagram(s) out of date. Run: pnpm doc:diagrams`);
    process.exit(1);
  }
  console.log(`  ${seen.size} diagrams, all current`);
  process.exit(0);
}

if (!wanted.length) {
  console.log(`  ${seen.size} diagrams, all current — nothing to render (--all forces it)`);
} else {
  // A missing mermaid or Chrome is the ordinary case here, not a crash: say what
  // to install, and skip the stack trace that says nothing to the person reading.
  const svgs = await renderDiagrams(wanted).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
  await mkdir(DIAGRAMS, { recursive: true });
  for (const { id, hash, doc } of wanted) {
    await writeFile(svgPath(id), svgs.get(id) + "\n");
    manifest[id] = { doc, sha256: hash };
    console.log(`  rendered doc/diagrams/${id}.svg`);
  }
  await writeManifest(manifest);
}

if (orphans.length) {
  console.warn(
    `\nStill in the manifest but in no document: ${orphans.join(", ")}.\n` +
      `Nothing reads them; delete doc/diagrams/<id>.svg and their manifest entries by hand.`,
  );
}
