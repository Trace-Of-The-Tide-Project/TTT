"use client";

import { useTranslations } from "next-intl";
import { CalendarIcon, EmailIcon, PersonIcon, UserCheckIcon } from "@/components/ui/icons";
import { useAuthUser } from "@/components/providers/AuthProvider";
import { useAccountOverview } from "@/hooks/queries/account";
import { settingsCardClass } from "../SettingsPrimitives";

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type InfoRowProps = { icon: React.ReactNode; label: string; children: React.ReactNode };

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--tott-card-border)] py-4 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-[var(--tott-muted)]">{icon}</span>
        <span className="text-sm text-[var(--tott-muted)]">{label}</span>
      </div>
      <div className="min-w-0 text-right text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

export function AccountOverview() {
  const t = useTranslations("Dashboard.account");
  const fallback = useAuthUser();
  const { data, isPending, isError } = useAccountOverview();

  const email = data?.email ?? fallback?.email ?? "";
  const username = data?.username ?? fallback?.username ?? "";
  const roles = data?.roles ?? fallback?.roles ?? [];
  const status = data?.status ?? "active";

  const statusLabel = (() => {
    switch (status) {
      case "active":
        return t("overview.statusActive");
      case "deactivated":
      case "inactive":
        return t("overview.statusDeactivated");
      case "suspended":
        return t("overview.statusSuspended");
      case "pending":
        return t("overview.statusPending");
      default:
        return status;
    }
  })();
  const statusPositive = status === "active";

  return (
    <section className={settingsCardClass} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}>
      <div className="mb-2">
        <h2 className="text-lg font-bold text-foreground">{t("overview.title")}</h2>
        <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("overview.subtitle")}</p>
      </div>

      <div className="mt-4">
        <InfoRow icon={<EmailIcon />} label={t("overview.email")}>
          <span className="flex items-center justify-end gap-2">
            <span className="truncate">{email || "—"}</span>
            {data?.email_verified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--tott-dash-positive)]/40 bg-[var(--tott-dash-positive)]/10 px-2 py-0.5 text-xs font-medium text-[var(--tott-dash-positive)]">
                {t("overview.verified")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-700/50 bg-yellow-900/20 px-2 py-0.5 text-xs font-medium text-yellow-500">
                {t("overview.unverified")}
              </span>
            )}
          </span>
        </InfoRow>

        <InfoRow icon={<PersonIcon />} label={t("overview.username")}>
          {username || "—"}
        </InfoRow>

        <InfoRow icon={<UserCheckIcon />} label={t("overview.status")}>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              statusPositive
                ? "border border-[var(--tott-dash-positive)]/40 bg-[var(--tott-dash-positive)]/10 text-[var(--tott-dash-positive)]"
                : "border border-[var(--tott-dash-negative)]/40 bg-[var(--tott-dash-negative)]/10 text-[var(--tott-dash-negative)]"
            }`}
          >
            {statusLabel}
          </span>
        </InfoRow>

        {roles.length > 0 ? (
          <InfoRow icon={<UserCheckIcon />} label={t("overview.roles")}>
            <span className="flex flex-wrap justify-end gap-1.5">
              {roles.map((r) => (
                <span
                  key={r}
                  className="rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-2 py-0.5 text-xs capitalize text-[var(--tott-muted)]"
                >
                  {r}
                </span>
              ))}
            </span>
          </InfoRow>
        ) : null}

        <InfoRow icon={<CalendarIcon />} label={t("overview.memberSince")}>
          {isPending ? "…" : formatDate(data?.createdAt ?? "")}
        </InfoRow>
      </div>

      {isError ? (
        <p className="mt-4 text-sm text-[var(--tott-dash-negative)]" role="alert">
          {t("overview.loadError")}
        </p>
      ) : null}
    </section>
  );
}
