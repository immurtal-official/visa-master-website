/* The compiled bundle only puts CAPITAL-INITIAL exports on window.<Namespace>, so useful
   lowercase functions (t, has, registerStrings, isWeChat…) sit in bundle scope unreachable
   from a consuming page — and every consumer reimplements them, which is how a fallback
   creeps back into a system that forbids one. expose() publishes them onto the namespace
   as soon as the bundle has created it.

   A capital-initial handle is still exported alongside (I18n) for anyone who would rather
   not depend on this at all. */
export function expose(map) {
  if (typeof window === "undefined") return;
  const publish = () => {
    let found = false;
    for (const key of Object.keys(window)) {
      if (!key.startsWith("VisaMasterDesignSystem")) continue;
      const ns = window[key];
      if (!ns || typeof ns !== "object") continue;
      Object.assign(ns, map);
      found = true;
    }
    return found;
  };
  // The namespace object is created after this module evaluates, so retry briefly.
  if (publish()) return;
  let tries = 0;
  const timer = setInterval(() => { if (publish() || ++tries > 40) clearInterval(timer); }, 25);
}
