"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  FacebookIcon,
  TwitterXIcon,
  YoutubeIcon,
  InstagramIcon,
  EmailIcon,
  MapPinIcon,
} from "@/components/ui/icons";
import { theme } from "@/lib/theme";

const SOCIAL = [
  { key: "facebook" as const, href: "https://facebook.com", icon: FacebookIcon },
  { key: "twitter" as const, href: "https://x.com", icon: TwitterXIcon },
  { key: "youtube" as const, href: "https://youtube.com", icon: YoutubeIcon },
  { key: "instagram" as const, href: "https://instagram.com", icon: InstagramIcon },
];

const PALESTINE = [
  { key: "stone" as const, href: "#", emoji: "🪨" },
  { key: "salt" as const, href: "#", emoji: "🧂" },
  { key: "compass" as const, href: "#", emoji: "🗺️" },
];

const FIELDS = [
  { key: "harbour" as const, href: "#", emoji: "⚓" },
  { key: "courtyard" as const, href: "#", emoji: "🌿" },
  { key: "hill" as const, href: "#", emoji: "🌕" },
];

export function Footer() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer
      className="w-full select-none"
      style={{ backgroundColor: theme.pageBackground, color: "var(--foreground)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            <Image
              src="/images/footer-Logo.png"
              alt={t("logoAlt")}
              width={100}
              height={24}
              className="h-6 w-auto object-contain"
            />
            <p className="max-w-xs text-sm text-gray-500">
              <span className="font-bold text-foreground">{t("taglineLead")}</span> {t("taglineBody")}
            </p>
            <div className="flex gap-3">
              {SOCIAL.map(({ key, href, icon: Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:text-foreground"
                  style={{ backgroundColor: theme.cardBorder }}
                  aria-label={t(`social.${key}`)}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-400">{t("palestineHeading")}</h3>
            <ul className="space-y-3">
              {PALESTINE.map(({ href, emoji, key }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm transition-colors hover:opacity-90"
                  >
                    <span className="shrink-0 text-lg leading-none">{emoji}</span>
                    <span>
                      <span className="font-semibold text-foreground">
                        {t(`palestine.${key}.title`)}
                      </span>{" "}
                      <span className="text-gray-400">{t(`palestine.${key}.description`)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-400">{t("fieldsHeading")}</h3>
            <ul className="space-y-3">
              {FIELDS.map(({ href, emoji, key }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="flex items-start gap-2 text-sm transition-colors hover:opacity-90"
                  >
                    <span className="shrink-0 text-lg leading-none">{emoji}</span>
                    <span>
                      <span className="font-semibold text-foreground">
                        {t(`fields.${key}.title`)}
                      </span>{" "}
                      <span className="text-gray-400">{t(`fields.${key}.description`)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold text-gray-400">{t("contactHeading")}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:director@traceofthetides.org"
                  className="flex items-center gap-2 text-sm transition-colors hover:text-foreground"
                >
                  <span className="shrink-0 ">
                    <EmailIcon />
                  </span>
                  <span>director@traceofthetides.org</span>
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm">
                  <span className="shrink-0">
                    <MapPinIcon />
                  </span>
                  <span>{t("contactLocation")}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t py-6" style={{ borderColor: theme.cardBorder }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8 lg:px-10">
          <p className="text-center text-sm text-gray-500 sm:text-left">{t("copyright", { year })}</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-400">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              {t("privacy")}
            </Link>
            <span className="text-gray-400" aria-hidden>
              ·
            </span>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              {t("terms")}
            </Link>
            <span className="text-gray-400" aria-hidden>
              ·
            </span>
            <Link href="/gdpr" className="transition-colors hover:text-foreground">
              {t("gdpr")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
