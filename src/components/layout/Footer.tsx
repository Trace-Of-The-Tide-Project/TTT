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
  const headingColor = "var(--tott-home-text-heading)";
  const mutedColor = "var(--tott-home-text-muted)";

  return (
    <footer
      className="w-full select-none"
      style={{
        backgroundColor: "var(--tott-home-surface)",
        color: "var(--foreground)",
      }}
    >
      {/* Figma frame: 1440×301, padding 40px, gap 24px. No max-width cap so wide screens fill. */}
      <div className="flex w-full flex-col items-stretch gap-6 p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          <div className="flex flex-col items-start gap-4">
            <Image
              src="/images/footer-Logo.png"
              alt={t("logoAlt")}
              width={56}
              height={16}
              className="h-4 w-auto object-contain"
            />
            <p className="max-w-xs text-sm leading-relaxed" style={{ color: mutedColor }}>
              <span className="font-bold text-foreground">{t("taglineLead")}</span> {t("taglineBody")}
            </p>
            <div className="mt-1 flex items-center gap-4">
              {SOCIAL.map(({ key, href, icon: Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                  style={{ color: mutedColor }}
                  aria-label={t(`social.${key}`)}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold" style={{ color: headingColor }}>{t("palestineHeading")}</h3>
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
                      <span style={{ color: mutedColor }}>{t(`palestine.${key}.description`)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold" style={{ color: headingColor }}>{t("fieldsHeading")}</h3>
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
                      <span style={{ color: mutedColor }}>{t(`fields.${key}.description`)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-semibold" style={{ color: headingColor }}>{t("contactHeading")}</h3>
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

        <div
          className="flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row sm:gap-4"
          style={{ borderColor: theme.cardBorder }}
        >
          <p className="text-center text-sm sm:text-left" style={{ color: mutedColor }}>
            {t("copyright", { year })}
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-2 text-sm"
            style={{ color: mutedColor }}
          >
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              {t("privacy")}
            </Link>
            <span style={{ color: mutedColor }} aria-hidden>
              ·
            </span>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              {t("terms")}
            </Link>
            <span style={{ color: mutedColor }} aria-hidden>
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
