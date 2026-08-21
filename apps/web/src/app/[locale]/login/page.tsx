import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export default async function LoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-10)" }}>
      <Card>
        <LoginForm locale={locale} configured={isSupabaseConfigured()} />
      </Card>
    </main>
  );
}
