"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

export type EditorApplication = {
  id: string;
  initials: string;
  name: string;
  badge: string;
  experience: string;
  timeAgo: string;
};

type EditorApplicationsProps = {
  items: EditorApplication[];
  viewAllHref?: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

const AVATAR_TONE = { bg: "var(--tott-dash-gold-text)", fg: "var(--background)" };
function avatarTone(_seed: string) {
  return AVATAR_TONE;
}

export function EditorApplications({ items, viewAllHref, onApprove, onReject }: EditorApplicationsProps) {
  const t = useTranslations("Dashboard.adminHome.editorApplications");
  return (
    <div className="relative p-6">
      <ChamferedFrame />
      <div className="relative mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">{t("title")}</h3>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="rounded-lg bg-[var(--tott-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:bg-[var(--tott-elevated-hover)]"
          >
            {t("viewAll")}
          </Link>
        )}
      </div>

      <div className="relative grid grid-cols-[1fr_auto] gap-x-4 text-xs">
        <div className="border-b border-[var(--tott-dash-divider)] pb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--tott-muted)]">
          {t("applicantHeader")}
        </div>
        <div className="border-b border-[var(--tott-dash-divider)] pb-2 text-end text-[11px] font-semibold uppercase tracking-wide text-[var(--tott-muted)]">
          {t("statusHeader")}
        </div>

        {items.map((app) => {
          const tone = avatarTone(app.id || app.name);
          return (
            <div
              key={app.id}
              className="relative col-span-2 grid grid-cols-[1fr_auto] items-center gap-x-4 px-5 py-4"
            >
              <ChamferedFrame size={14} />
              <div className="relative flex min-w-0 items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{ backgroundColor: tone.bg, color: tone.fg }}
                >
                  {app.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{app.name}</p>
                  <p className="truncate text-xs text-[var(--tott-muted)]">{app.experience}</p>
                </div>
              </div>

              <div className="relative flex shrink-0 items-center gap-2">
                <span className="rounded bg-[var(--tott-elevated)] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--tott-muted)]">
                  {app.badge}
                </span>
                <button
                  type="button"
                  onClick={() => onApprove?.(app.id)}
                  className="rounded-lg bg-[var(--tott-elevated)] px-3 py-1 text-[11px] font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:bg-[var(--tott-elevated-hover)]"
                >
                  {t("review")}
                </button>
                <button
                  type="button"
                  onClick={() => onReject?.(app.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
                  aria-label={t("more")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
