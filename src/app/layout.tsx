import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Mono, IBM_Plex_Serif } from "next/font/google";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

/** Inline before paint so `data-theme` matches stored preference (avoids flash). Default: dark. */
const THEME_BOOTSTRAP = `(function(){try{var k='tott-color-scheme',s=localStorage.getItem(k),t=s==='light'||s==='dark'||s==='tide'?s:'dark';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t==='dark'?'dark':'light';}catch(e){}})();`;

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexSerif = IBM_Plex_Serif({
  variable: "--font-plex-serif",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Trace of The Tide",
  description: "Trace of The Tide",
  icons: {
    icon: "/favicon.svg",
  },
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
  const dir = locale === "ar" ? "rtl" : "ltr"; // extend this list if Hebrew/Farsi added

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${plexSans.variable} ${plexArabic.variable} ${plexMono.variable} ${plexSerif.variable} min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {children}
      </body>
    </html>
  );
}
