"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { useSessionContributions } from "@/hooks/queries/sessions";
import { dirFor } from "@/i18n/dir";
import type { SessionListItem } from "@/services/sessions.service";

function formatStartsAt(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
}

function RecordingCard({ session, locale }: { session: SessionListItem; locale: string }) {
  const t = useTranslations("Waqamh");
  const { data: links = [] } = useSessionContributions(session.id);

  return (
    <ChamferedPanel className="p-6">
      <h2
        className="text-start text-lg font-semibold text-[var(--tott-home-text-warm)]"
        dir={dirFor(session.locale)}
      >
        {session.title}
      </h2>
      {session.starts_at ? (
        <p className="mt-1 text-start text-sm text-[var(--tott-salt)]">
          {formatStartsAt(session.starts_at, locale)}
        </p>
      ) : null}
      {links.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1">
          {links.map((linkItem) => (
            <li key={linkItem.id}>
              {linkItem.article ? (
                <Link
                  href={"/content/" + (linkItem.article.slug ?? linkItem.article.id)}
                  className="text-start text-sm text-[var(--tott-accent-gold)] underline"
                >
                  {t("readAlongside")}: {linkItem.article.title}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </ChamferedPanel>
  );
}

export function AudioLibraryContent({ sessions }: { sessions: SessionListItem[] }) {
  const t = useTranslations("Waqamh");
  const locale = useLocale();

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl">
        {t("audioLibraryTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-start text-sm text-[var(--tott-salt)]">
        {t("audioLibrarySubtitle")}
      </p>

      {sessions.length === 0 ? (
        <p className="mt-10 text-start text-[var(--tott-salt)]">{t("audioLibraryEmpty")}</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {sessions.map((session) => (
            <li key={session.id}>
              <RecordingCard session={session} locale={locale} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
