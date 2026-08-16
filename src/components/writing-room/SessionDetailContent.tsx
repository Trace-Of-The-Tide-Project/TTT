"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { useSession } from "@/hooks/queries/sessions";
import { useRegisterSession } from "@/hooks/mutations/sessions";
import type { SessionDetail } from "@/services/sessions.service";

function formatDate(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" });
  return fmt.format(d);
}

export function SessionDetailContent({ session: initial }: { session: SessionDetail }) {
  const t = useTranslations("WritingRoomSessions");
  const locale = useLocale();
  const { data } = useSession(initial.id);
  const session = data ?? initial;
  const register = useRegisterSession(initial.id);

  const startsAt = formatDate(session.starts_at, locale);
  const allowed = session.access?.allowed ?? false;
  const hasTicket = session.access?.matched_step === "ticket";

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl">
        {session.title}
      </h1>
      {startsAt && (
        <p className="mt-2 text-start text-sm text-[var(--tott-salt)]">{startsAt}</p>
      )}
      {session.description && (
        <p className="mt-6 text-start text-base text-[var(--tott-home-text-warm)]">
          {session.description}
        </p>
      )}

      <ChamferedPanel className="mt-8 p-6">
        {hasTicket ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-start text-sm text-[var(--tott-status-emerald)]">
              {t("youAreRegistered")}
            </p>
            <Link
              href={`/writing-room/sessions/${session.id}/workspace`}
              className="rounded-md bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-medium text-black"
            >
              {t("openWorkspace")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-start text-sm text-[var(--tott-salt)]">
              {allowed ? t("readyToRegister") : t("registrationRequiresEntitlement")}
            </p>
            <button
              type="button"
              disabled={register.isPending}
              onClick={() => register.mutate(undefined)}
              className="rounded-md bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
            >
              {t("register")}
            </button>
          </div>
        )}
      </ChamferedPanel>
    </section>
  );
}
