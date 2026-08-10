import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { Wordmark } from "./wordmark";

/**
 * The navy footer.
 *
 * It carries the service-boundary line, which sits in plain sight rather than
 * behind a link: every surface that makes a claim carries its limit next to it.
 * The switcher is repeated here so it is reachable on a phone, where the header
 * copy is hidden at narrow widths.
 *
 * The record slot is where a mainland ICP filing number goes once a CN entity
 * exists; it is deliberately empty rather than filled with a placeholder.
 */
export function SiteFooter() {
  const t = useTranslations("chrome.footer");

  return (
    <footer
      style={{
        background: "var(--surface-inverse)",
        color: "var(--blue-100)",
        paddingBlock: "var(--space-10) var(--space-8)",
        paddingInline: "var(--gutter-mobile)",
        marginBlockStart: "var(--space-16)",
      }}
    >
      <div style={{ maxInlineSize: "var(--container-max)", marginInline: "auto" }}>
        <Wordmark tone="inverse" />

        <div style={{ marginBlockStart: "var(--space-6)" }}>
          <LanguageSwitcher placement="footer" />
        </div>

        <p
          style={{
            marginBlockStart: "var(--space-8)",
            paddingBlockStart: "var(--space-5)",
            borderBlockStart: "1px solid var(--blue-800)",
            fontSize: "var(--fs-12)",
            lineHeight: 1.8,
            color: "var(--blue-300)",
            maxInlineSize: "var(--measure-prose)",
          }}
        >
          {t("disclaimer")}
        </p>
      </div>
    </footer>
  );
}
