"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { LOCALES, LOCALE_SELF_NAMES, type Locale } from "@visa-master/core/locales";
import { Icon } from "@/components/ui/icon";
import { Link, usePathname } from "@/i18n/navigation";

export interface LanguageSwitcherProps {
  placement?: "header" | "nav" | "footer";
}

/**
 * The interface-language switcher.
 *
 * Two things about it are not decoration. Each language names itself, in
 * itself — 简体中文, English — because a flag denotes a country and gets this
 * wrong in both directions. And the note beneath is the reason the component
 * exists: switching the interface does not change the language of the delivered
 * documents, which the destination country decides. Users assume otherwise, and
 * either misunderstanding damages the trust the product is sold on, so the note
 * is permanent copy and never a tooltip.
 *
 * Switching links to the same path under the other locale, so it can be reached
 * mid-form without losing the reader's place.
 */
export function LanguageSwitcher({ placement = "header" }: LanguageSwitcherProps) {
  const t = useTranslations("languageSwitcher");
  const pathname = usePathname();
  const params = useParams();
  const active = params.locale as Locale;

  const inverse = placement === "footer";
  const stacked = placement !== "header";
  const muted = inverse ? "var(--blue-300)" : "var(--text-muted)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        flexWrap: "wrap",
        alignItems: stacked ? "stretch" : "center",
        gap: stacked ? "var(--space-2)" : "var(--space-3)",
        minInlineSize: 0,
      }}
    >
      <div
        role="group"
        aria-label={t("groupLabel")}
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
          padding: 2,
          background: inverse ? "rgba(255,255,255,.08)" : "var(--ink-50)",
          border: `1px solid ${inverse ? "var(--blue-800)" : "var(--border-subtle)"}`,
          borderRadius: "var(--radius-pill)",
        }}
      >
        <Icon
          name="languages"
          size={16}
          style={{ color: muted, marginInlineStart: 6, marginInlineEnd: 2 }}
        />
        {LOCALES.map((locale) => {
          const on = locale === active;
          return (
            <Link
              key={locale}
              href={pathname}
              locale={locale}
              lang={locale}
              aria-current={on ? "true" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minBlockSize: stacked ? "var(--touch-min)" : 34,
                paddingInline: "var(--space-4)",
                borderRadius: "var(--radius-pill)",
                background: on
                  ? inverse
                    ? "var(--white)"
                    : "var(--action-primary)"
                  : "transparent",
                color: on
                  ? inverse
                    ? "var(--blue-900)"
                    : "var(--white)"
                  : inverse
                    ? "var(--blue-100)"
                    : "var(--text-body)",
                fontSize: "var(--fs-14)",
                fontWeight: on ? "var(--fw-medium)" : "var(--fw-regular)",
                textDecoration: "none",
                transition: "var(--transition-control)",
                textAlign: "center",
              }}
            >
              {/* Self-names are never translated: 中文 is 中文 in every interface. */}
              {LOCALE_SELF_NAMES[locale]}
            </Link>
          );
        })}
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "var(--fs-12)",
          lineHeight: 1.6,
          color: muted,
          maxInlineSize: stacked ? "none" : "26em",
          textWrap: "pretty",
        }}
      >
        {t("note")}
      </p>
    </div>
  );
}
