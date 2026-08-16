"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import type { SessionListItem } from "@/services/sessions.service";

function formatStartsAt(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function SessionsListContent({
  sessions,
}: {
  sessions: SessionListItem[];
}) {
  const t = useTranslations("WritingRoomSessions");
  const locale = useLocale();

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl">
        {t("listTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-start text-sm text-[var(--tott-salt)]">
        {t("listSubtitle")}
      </p>

      {sessions.length === 0 ? (
        <p className="mt-10 text-start text-[var(--tott-salt)]">{t("empty")}</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {sessions.map((session) => {
            const facilitatorName =
              session.facilitator?.full_name ?? session.facilitator?.username ?? "";
            return (
              <li key={session.id}>
                <Link href={`/writing-room/sessions/${session.id}`}>
                  <ChamferedPanel className="h-full p-6 transition-colors hover:bg-[var(--tott-elevated-hover)]">
                    <h2 className="text-start text-lg font-semibold text-[var(--tott-home-text-warm)]">
                      {session.title}
                    </h2>
                    {session.starts_at && (
                      <p className="mt-1 text-start text-sm text-[var(--tott-salt)]">
                        {formatStartsAt(session.starts_at, locale)}
                      </p>
                    )}
                    {facilitatorName && (
                      <p className="mt-3 text-start text-sm text-[var(--tott-salt)]">
                        {t("facilitatedBy", { name: facilitatorName })}
                      </p>
                    )}
                  </ChamferedPanel>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
