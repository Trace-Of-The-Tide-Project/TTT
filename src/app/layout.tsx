import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

/** Inline before paint so `data-theme` matches stored preference (avoids flash). */
const THEME_BOOTSTRAP = `(function(){try{var k='tott-color-scheme',s=localStorage.getItem(k),m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',t=s==='light'||s==='dark'?s:m;document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t==='dark'?'dark':'light';}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trace of The Tide",
  description: "Trace of The Tide",
};

function resolveRootLocale(requested: string | undefined): string {
  if (requested && hasLocale(routing.locales, requested)) return requested;
  return routing.defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let requested: string | undefined;
  try {
    requested = await getLocale();
  } catch {
    requested = undefined;
  }
  const locale = resolveRootLocale(requested);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {children}
      </body>
    </html>
  );
}
