import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/chrome/site-footer";
import { SiteHeader } from "@/components/chrome/site-header";
import { routing } from "@/i18n/routing";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // An unknown locale reaching this far means a URL that the middleware did not
  // rewrite; it is a 404, not a silent fall back to Chinese.
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    // `lang` is doing real work beyond assistive technology and indexing: the
    // type tokens carry the Chinese line heights by default and re-resolve to
    // the Latin ones under [lang^="en"], so the whole document follows from it.
    <html lang={locale}>
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minBlockSize: "100dvh",
        }}
      >
        <NextIntlClientProvider>
          <SiteHeader />
          <div style={{ flex: 1 }}>{children}</div>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
