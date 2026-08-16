"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { dirFor } from "@/i18n/dir";
import type { SessionListItem } from "@/services/sessions.service";

function formatStartsAt(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function SalonLandingContent({ sessions }: { sessions: SessionListItem[] }) {
  const t = useTranslations("Waqamh");
  const locale = useLocale();
  const [now] = useState(() => Date.now());

  const [upcoming, past] = useMemo(() => {
    const up: SessionListItem[] = [];
    const done: SessionListItem[] = [];
    for (const s of sessions) {
      const isPast = s.starts_at ? new Date(s.starts_at).getTime() < now : false;
      (isPast ? done : up).push(s);
    }
    return [up, done];
  }, [sessions, now]);

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl">
        {t("landingTitle")}
      </h1>
      <p className="mt-2 max-w-2xl text-start text-sm text-[var(--tott-salt)]">
        {t("landingSubtitle")}
      </p>

      <div className="mt-8 flex gap-2">
        {(["upcoming", "past"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="rounded-md px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: tab === key ? "var(--tott-accent-gold)" : "var(--tott-elevated)",
              color: tab === key ? "black" : "var(--tott-home-text-warm)",
            }}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-start text-[var(--tott-salt)]">{t("empty")}</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {list.map((session) => {
            const voices = session.voices ?? [];
            return (
              <li key={session.id}>
                <Link href={`/waqamh/sessions/${session.id}`}>
                  <ChamferedPanel className="h-full p-6 transition-colors hover:bg-[var(--tott-elevated-hover)]">
                    <h2
                      className="text-start text-lg font-semibold text-[var(--tott-home-text-warm)]"
                      dir={dirFor(session.locale)}
                    >
                      {session.title}
                    </h2>
                    {session.starts_at && (
                      <p className="mt-1 text-start text-sm text-[var(--tott-salt)]">
                        {formatStartsAt(session.starts_at, locale)}
                      </p>
                    )}
                    {voices.length > 0 && (
                      <p className="mt-3 text-start text-sm text-[var(--tott-salt)]">
                        {t("voices")}: {voices.join(", ")}
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
