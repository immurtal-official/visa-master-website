/* Regenerates components/core/icons.data.js from assets/icons/*.svg, so the glyphs are
 * compiled into _ds_bundle.js and ride with it. Run after adding or replacing an icon:
 *
 *   node .build/build-icons.mjs
 *
 * Icons come from Lucide 0.475.0 and are self-hosted; nothing is ever fetched from a CDN.
 */
/* Node-only; see the guard at the bottom. */
async function main() {
  const { readdirSync, readFileSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  

  /* Run from the project root: node .build/<script>.mjs */
  const ROOT = process.cwd();
  const SRC = join(ROOT, "assets/icons");
  const OUT = join(ROOT, "components/core/icons.data.js");

  const names = readdirSync(SRC).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4)).sort();
  const entries = names.map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(readFileSync(join(SRC, n + ".svg"), "utf8").replace(/\n\s*/g, "").trim())},`);

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
