import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware navigation.
 *
 * Every internal link and redirect goes through these rather than through
 * `next/link` directly, so a route prefix is never assembled by hand and
 * switching language keeps the reader on the page they were on.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
