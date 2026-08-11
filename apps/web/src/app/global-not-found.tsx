import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, LOCALE_ROUTE_PREFIXES } from "@visa-master/core/locales";
import zhCN from "../../messages/zh-CN.json";
import en from "../../messages/en.json";
import "./globals.css";

/**
 * The page for a URL that matches no route.
 *
 * It renders its own document rather than sitting inside the locale layout,
 * which is what this file convention is for: the layout lives under a dynamic
 * `[locale]` segment, and a URL that matches nothing has no segment to read a
 * locale from. The alternative — a catch-all page calling notFound() — returns
 * the right status and renders a blank page, because that path is recovered on
 * the client and never written into the HTML. A blank page is worse than a
 * plain one.
 *
 * Both languages appear, for the same reason the sign-in email carries both:
 * at this point the reader's language is genuinely unknown, and guessing wrong
 * means answering someone in a language they may not read. Two short sentences
 * is a smaller cost than that.
 */
const CATALOGUES = { "zh-CN": zhCN, en } as const;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body>
        <main
          className="vm-container"
          style={{ paddingBlock: "var(--space-16)", minBlockSize: "60dvh" }}
        >
          {LOCALES.map((locale, index) => {
            const messages = CATALOGUES[locale];
            return (
              <section
                key={locale}
                lang={locale}
                style={{ marginBlockStart: index === 0 ? 0 : "var(--space-10)" }}
              >
                {index === 0 ? (
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "var(--type-h1-size)",
                      lineHeight: "var(--type-h1-lh)",
                      fontWeight: "var(--fw-semibold)",
                      color: "var(--text-heading)",
                    }}
                  >
                    {messages.errors.notFound.title}
                  </h1>
                ) : (
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "var(--type-h2-size)",
                      lineHeight: "var(--type-h2-lh)",
                      fontWeight: "var(--fw-semibold)",
                      color: "var(--text-heading)",
                    }}
                  >
                    {messages.errors.notFound.title}
                  </h2>
                )}

                <p
                  style={{
                    marginBlockStart: "var(--space-3)",
                    maxInlineSize: "var(--measure-prose)",
                    color: "var(--text-body)",
                  }}
                >
                  {messages.errors.notFound.body}
                </p>

                <p style={{ marginBlockStart: "var(--space-4)" }}>
                  <a href={LOCALE_ROUTE_PREFIXES[locale]} style={{ color: "var(--text-link)" }}>
                    {messages.meta.title}
                  </a>
                </p>
              </section>
            );
          })}
        </main>
      </body>
    </html>
  );
}
