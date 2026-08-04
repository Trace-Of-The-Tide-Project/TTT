"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import {
  SearchIcon,
  BookIcon,
  MessageSquareIcon,
  ShieldIcon,
  HeadsetIcon,
  EmailIcon,
  ChevronRightIcon,
  UsersIcon,
  FileTextIcon,
  SettingsIcon,
} from "@/components/ui/icons";

const SUPPORT_EMAIL = "support@traceofthetide.com";

type QuickLink = {
  key: string;
  href: string;
  icon: typeof BookIcon;
};

const QUICK_LINKS: QuickLink[] = [
  { key: "articles", href: "/admin/articles", icon: FileTextIcon },
  { key: "users", href: "/admin/users", icon: UsersIcon },
  { key: "settings", href: "/admin/settings", icon: SettingsIcon },
  { key: "security", href: "/admin/security", icon: ShieldIcon },
];

type FaqEntry = { key: string };

const FAQ_KEYS: FaqEntry[] = [
  { key: "publishArticle" },
  { key: "manageRoles" },
  { key: "featureWriter" },
  { key: "moderateContent" },
  { key: "resetPassword" },
  { key: "webhookIssues" },
];

export function HelpCenterContent() {
  const t = useTranslations("Dashboard.help");
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_KEYS;
    return FAQ_KEYS.filter((f) => {
      const question = t(`faq.${f.key}.question`).toLowerCase();
      const answer = t(`faq.${f.key}.answer`).toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [query, t]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 ps-10 pe-4 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60"
        />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--tott-muted)]">
          {t("quickLinksHeading")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-4 py-3.5 transition-colors hover:border-[var(--tott-accent-gold)]/50 hover:bg-[var(--tott-dash-ghost-hover)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--tott-accent-gold)]/10 text-[var(--tott-accent-gold)]">
                <Icon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {t(`quickLinks.${key}.title`)}
                </span>
                <span className="block truncate text-xs text-[var(--tott-muted)]">
                  {t(`quickLinks.${key}.subtitle`)}
                </span>
              </span>
              <span className="shrink-0 text-[var(--tott-muted)] transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:-scale-x-100">
                <ChevronRightIcon />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--tott-muted)]">
          {t("faqHeading")}
        </h2>
        <ChamferedPanel className="overflow-hidden">
          <div className="divide-y divide-[var(--tott-card-border)] border border-[var(--tott-card-border)]">
            {filteredFaqs.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[var(--tott-muted)]">
                {t("faqEmpty")}
              </p>
            ) : (
              filteredFaqs.map((f) => {
                const isOpen = openFaq === f.key;
                return (
                  <div key={f.key}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : f.key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-start text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
                    >
                      {t(`faq.${f.key}.question`)}
                      <span
                        className={`shrink-0 text-[var(--tott-muted)] transition-transform ${isOpen ? "rotate-90" : "rtl:-scale-x-100"}`}
                      >
                        <ChevronRightIcon />
                      </span>
                    </button>
                    {isOpen ? (
                      <p className="px-5 pb-4 text-sm text-[var(--tott-muted)]">
                        {t(`faq.${f.key}.answer`)}
                      </p>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </ChamferedPanel>
      </div>

      {/* Contact support */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--tott-muted)]">
          {t("contactHeading")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-3 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-4 py-3.5 transition-colors hover:border-[var(--tott-accent-gold)]/50 hover:bg-[var(--tott-dash-ghost-hover)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--tott-accent-gold)]/10 text-[var(--tott-accent-gold)]">
              <EmailIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">{t("contact.email.title")}</span>
              <span className="block truncate text-xs text-[var(--tott-muted)]">{SUPPORT_EMAIL}</span>
            </span>
          </a>
          <Link
            href="/admin/messaging"
            className="flex items-center gap-3 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-4 py-3.5 transition-colors hover:border-[var(--tott-accent-gold)]/50 hover:bg-[var(--tott-dash-ghost-hover)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--tott-accent-gold)]/10 text-[var(--tott-accent-gold)]">
              <MessageSquareIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">{t("contact.messaging.title")}</span>
              <span className="block truncate text-xs text-[var(--tott-muted)]">{t("contact.messaging.subtitle")}</span>
            </span>
          </Link>
        </div>
      </div>

      <p className="flex items-center gap-2 text-xs text-[var(--tott-muted)]">
        <HeadsetIcon />
        {t("footerNote")}
      </p>
    </div>
  );
}
