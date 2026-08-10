import React from "react";
import { ICON_SVG } from "./icons.data.js";

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
  if (typeof window !== "undefined" && window.VM_ICON_BASE) return (ICON_BASE = window.VM_ICON_BASE);
  if (typeof document !== "undefined") {
    const s = Array.from(document.querySelectorAll("script[src]")).find((x) => /_ds_bundle\.js(\?|$)/.test(x.getAttribute("src") || ""));
    if (s) return (ICON_BASE = new URL("assets/icons/", s.src).href);
  }
  return (ICON_BASE = "assets/icons/");
}

const warned = new Set();
function maskUrl(name) {
  const svg = ICON_SVG[name];
  if (svg) return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  if (!warned.has(name)) {
    warned.add(name);
    console.warn(`[visa-master] icon "${name}" is not in the bundle. Add assets/icons/${name}.svg and run node .build/build-icons.mjs.`);
  }
  return `url("${iconBase()}${name}.svg")`;
}

/** Masked Lucide glyph, embedded in the bundle. Inherits currentColor, so it tints with the text around it. */
export function Icon({ name, size = 20, className, style, title }) {
  const url = maskUrl(name);
  return (
    <span
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{
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
        ...style,
      }}
    />
  );
}
