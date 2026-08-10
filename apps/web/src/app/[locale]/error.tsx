"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

/**
 * The locale-scoped error boundary.
 *
 * Next's own fallback is English, which is the wrong answer to give a reader
 * who has been in Chinese all the way to the failure.
 */
export default function LocaleError() {
  const t = useTranslations("errors.unexpected");

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-12)" }}>
      <Card>
        <h1
          style={{
            margin: 0,
            fontSize: "var(--type-h2-size)",
            lineHeight: "var(--type-h2-lh)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--text-heading)",
          }}
        >
          {t("title")}
        </h1>
        <p style={{ marginBlockStart: "var(--space-3)", color: "var(--text-body)" }}>{t("body")}</p>
      </Card>
    </main>
  );
}
