"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { GlobeIcon, LogOutIcon, TrashIcon } from "@/components/ui/icons";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAccountSessions } from "@/hooks/queries/account";
import { useRevokeSession } from "@/hooks/mutations/account";
import type { SessionItem } from "@/services/account.service";
import { settingsCardClass } from "../SettingsPrimitives";

function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** A short, human-friendly device label derived from the user agent string. */
function describeUserAgent(ua: string | null, unknownLabel: string): string {
  if (!ua) return unknownLabel;
  const browser = /Edg/.test(ua)
    ? "Edge"
    : /OPR|Opera/.test(ua)
      ? "Opera"
      : /Chrome/.test(ua)
        ? "Chrome"
        : /Firefox/.test(ua)
          ? "Firefox"
          : /Safari/.test(ua)
            ? "Safari"
            : null;
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X|Macintosh/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iOS/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  if (browser && os) return `${browser} · ${os}`;
  return browser ?? os ?? unknownLabel;
}

function SessionRow({
  session,
  onRevoke,
  revoking,
}: {
  session: SessionItem;
  onRevoke: (id: string) => void;
  revoking: boolean;
}) {
  const t = useTranslations("Dashboard.account");
  const device = describeUserAgent(session.user_agent, t("sessions.unknownDevice"));

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--tott-card-border)] py-4 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 shrink-0 text-gray-500">
          <GlobeIcon />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{device}</p>
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {session.ip_address || t("sessions.unknownIp")} ·{" "}
            {t("sessions.signedIn", { date: formatDateTime(session.created_at) })}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRevoke(session.id)}
        disabled={revoking}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--tott-card-border)] bg-transparent px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <TrashIcon />
        {t("sessions.revoke")}
      </button>
    </div>
  );
}

export function AccountSessions() {
  const t = useTranslations("Dashboard.account");
  const router = useRouter();
  const { logout } = useAuth();
  const { data: sessions, isPending, isError } = useAccountSessions();
  const revokeMutation = useRevokeSession();
  const [confirmSignOutAll, setConfirmSignOutAll] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOutEverywhere = useCallback(async () => {
    setSigningOut(true);
    try {
      await logout();
      router.push("/auth/login");
      router.refresh();
    } finally {
      setSigningOut(false);
      setConfirmSignOutAll(false);
    }
  }, [logout, router]);

  const list = sessions ?? [];

  return (
    <section className={settingsCardClass} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}>
      <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{t("sessions.title")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("sessions.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmSignOutAll(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
        >
          <LogOutIcon />
          {t("sessions.signOutEverywhere")}
        </button>
      </div>

      <p className="mb-2 text-xs text-gray-600">{t("sessions.currentDeviceHint")}</p>

      <div className="mt-2">
        {isPending ? (
          <p className="py-6 text-center text-sm text-gray-500">{t("sessions.loading")}</p>
        ) : isError ? (
          <p className="py-6 text-center text-sm text-[var(--tott-dash-negative)]" role="alert">
            {t("sessions.loadError")}
          </p>
        ) : list.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">{t("sessions.empty")}</p>
        ) : (
          list.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              onRevoke={(id) => revokeMutation.mutate(id)}
              revoking={revokeMutation.isPending}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={confirmSignOutAll}
        title={t("sessions.signOutEverywhere")}
        description={t("sessions.signOutEverywhereConfirm")}
        confirmLabel={t("sessions.signOutEverywhere")}
        confirmBusyLabel={t("sessions.signingOut")}
        cancelLabel={t("modal.cancel")}
        busy={signingOut}
        onClose={() => !signingOut && setConfirmSignOutAll(false)}
        onConfirm={() => void handleSignOutEverywhere()}
      />
    </section>
  );
}
