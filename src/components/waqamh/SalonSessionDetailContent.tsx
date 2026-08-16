"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { useSession } from "@/hooks/queries/sessions";
import { useRegisterSession } from "@/hooks/mutations/sessions";
import { dirFor } from "@/i18n/dir";
import { GiftTicketModal } from "./GiftTicketModal";
import type { SessionDetail } from "@/services/sessions.service";

function formatDate(iso: string | null | undefined, locale: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(d);
}

export function SalonSessionDetailContent({ session: initial }: { session: SessionDetail }) {
  const t = useTranslations("Waqamh");
  const locale = useLocale();
  const { data } = useSession(initial.id);
  const session = data ?? initial;
  const register = useRegisterSession(initial.id);
  const [giftOpen, setGiftOpen] = useState(false);

  const startsAt = formatDate(session.starts_at, locale);
  const allowed = session.access?.allowed ?? false;
  const hasTicket = session.access?.matched_step === "ticket";
  const voices = session.voices ?? [];

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8" dir={dirFor(session.locale)}>
      <h1 className="font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl">
        {session.title}
      </h1>
      {startsAt && <p className="mt-2 text-start text-sm text-[var(--tott-salt)]">{startsAt}</p>}
      {voices.length > 0 && (
        <p className="mt-2 text-start text-sm text-[var(--tott-salt)]">
          {t("voices")}: {voices.join(", ")}
        </p>
      )}
      {session.description && (
        <p className="mt-6 text-start text-base text-[var(--tott-home-text-warm)]">
          {session.description}
        </p>
      )}

      {(session.related_issue_id || session.related_book_id) && (
        <p className="mt-4 text-start text-sm text-[var(--tott-accent-gold)]">
          {session.related_issue_id ? t("relatedIssue") : t("relatedBook")}
        </p>
      )}

      <ChamferedPanel className="mt-8 p-6">
        {hasTicket ? (
          session.online_join_url ? (
            <a
              href={session.online_join_url}
              className="text-start text-sm text-[var(--tott-status-emerald)] underline"
            >
              {t("joinLink")}
            </a>
          ) : (
            <p className="text-start text-sm text-[var(--tott-status-emerald)]">
              {t("readyToRegister")}
            </p>
          )
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

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={() => setGiftOpen(true)}
          className="rounded-md bg-[var(--tott-elevated)] px-4 py-2 text-sm text-[var(--tott-home-text-warm)]"
        >
          {t("giftTicket")}
        </button>
      </div>

      <p className="mt-6 text-start text-sm">
        <Link href="/waqamh/audio" className="text-[var(--tott-accent-gold)] underline">
          {t("audioLibraryTitle")}
        </Link>
      </p>

      <GiftTicketModal sessionId={session.id} open={giftOpen} onClose={() => setGiftOpen(false)} />
    </section>
  );
}
