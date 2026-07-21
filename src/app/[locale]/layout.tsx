import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { HtmlLangFromLocale } from "@/components/i18n/HtmlLangFromLocale";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { routing } from "@/i18n/routing";
import { getCmsBranding } from "@/lib/nav/cms-nav-links";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const branding = await getCmsBranding();
  return {
    title: `Trace of The Tide — ${t("title")}`,
    description: "Trace of The Tide",
    ...(branding?.favicon ? { icons: { icon: branding.favicon } } : null),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  // CMS branding (admin editor's Branding tab) overriding the static
  // --tott-accent-gold / --tott-logo tokens from globals.css. `primary_color`
  // is already validated to a strict #rgb/#rrggbb hex by getCmsBranding —
  // never inline an unvalidated string into a style attribute.
  const branding = await getCmsBranding();
  const brandingStyle = branding?.primary_color
    ? ({
        "--tott-accent-gold": branding.primary_color,
        "--tott-accent-gold-focus": branding.primary_color,
        "--tott-logo": branding.primary_color,
      } as React.CSSProperties)
    : undefined;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HtmlLangFromLocale locale={locale} />
      <AuthProvider>
        <QueryProvider>
          <ThemeProvider>
            {brandingStyle ? <div style={brandingStyle}>{children}</div> : children}
          </ThemeProvider>
        </QueryProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
