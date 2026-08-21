import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  const t = useTranslations("errors.notFound");

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
