import type { ReactNode } from "react";

/**
 * Passthrough root.
 *
 * `<html>` and `<body>` belong to the locale layout, which is the only place
 * that knows the language — and `lang` is what selects the per-script line
 * height the type tokens carry, so it cannot be guessed here.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
