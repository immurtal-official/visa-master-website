import type { ReactNode } from "react";
import "./globals.css";

/**
 * Placeholder shell.
 *
 * The real document — including the `lang` attribute, which is what selects the
 * per-script line height the type tokens carry — belongs to the locale layout
 * that arrives with the i18n skeleton. Until then this renders the minimum a
 * Next.js app needs, and no copy: a user-facing string written before the
 * catalogue exists is a string that has to be found and moved later.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
