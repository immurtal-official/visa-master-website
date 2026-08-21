import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./language-switcher";
import { Wordmark } from "./wordmark";

export interface SiteHeaderProps {
  /** Rendered at the inline-end: sign in, or sign out when there is a session. */
  action?: ReactNode;
}

/**
 * The site header. It scrolls away — only the action bar pins, and not on these
 * pages.
 *
 * The switcher sits here on wide screens and moves into the footer's copy on
 * narrow ones, so it never takes one of the few top-level mobile nav slots. It
 * wraps rather than truncates: English runs longer than the Chinese beside it.
 */
export function SiteHeader({ action }: SiteHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--space-4)",
        flexWrap: "wrap",
        minBlockSize: 64,
        paddingBlock: "var(--space-2)",
        paddingInline: "var(--gutter-mobile)",
        background: "var(--white)",
        borderBlockEnd: "1px solid var(--border-subtle)",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <Wordmark size={17} />
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div className="vm-header-language">
          <LanguageSwitcher placement="header" />
        </div>
        {action}
      </div>
    </header>
  );
}
