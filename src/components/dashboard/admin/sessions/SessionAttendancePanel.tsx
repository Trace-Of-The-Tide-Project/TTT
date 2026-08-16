"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { ChamferedTable, type ChamferedTableColumn } from "@/components/ui/ChamferedTable";
import { useSessionStats, useSessionTickets } from "@/hooks/queries/sessions";
import { useMarkTicketAttended } from "@/hooks/mutations/sessions";
import type { SessionTicket } from "@/services/sessions.service";
import { formatApiError } from "@/lib/api/error-message";

type Props = { sessionId: string };

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-foreground" dir="ltr">
        {value}
      </p>
    </div>
  );
}

export function SessionAttendancePanel({ sessionId }: Props) {
  const t = useTranslations("Dashboard.sessions");
  const statsQuery = useSessionStats(sessionId);
  const ticketsQuery = useSessionTickets(sessionId);
  const attendMutation = useMarkTicketAttended();

  const stats = statsQuery.data;
  const tickets = ticketsQuery.data ?? [];

  const handleAttend = (ticketId: string) => {
    attendMutation.mutate(
      { ticketId, sessionId },
      {
        onSuccess: () => toast.success(t("attendance.toasts.marked")),
        onError: (e) => toast.error(formatApiError(e, t("attendance.errors.markFailed"))),
      },
    );
  };

  const columns: ChamferedTableColumn<SessionTicket>[] = [
    {
      key: "user",
      header: t("attendance.headers.user"),
      width: "34%",
      cellClassName: "px-5 py-3 text-sm text-foreground flex items-center",
      cell: (ticket) => <span dir="ltr">{ticket.user_id}</span>,
    },
    {
      key: "type",
      header: t("attendance.headers.type"),
      width: "20%",
      cellClassName: "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center",
      cell: (ticket) => t(`attendance.ticketType.${ticket.type}`),
    },
    {
      key: "status",
      header: t("attendance.headers.status"),
      width: "20%",
      cellClassName: "px-5 py-3 text-sm text-[var(--tott-muted)] flex items-center",
      cell: (ticket) => t(`attendance.ticketStatus.${ticket.status}`),
    },
    {
      key: "actions",
      header: "",
      width: "26%",
      align: "end",
      cellClassName: "flex items-center justify-end px-3 py-3",
      cell: (ticket) => (
        <button
          type="button"
          disabled={ticket.status === "attended" || attendMutation.isPending}
          onClick={() => handleAttend(ticket.id)}
          className="rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1 text-xs font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 disabled:opacity-40 transition-colors"
        >
          {ticket.status === "attended" ? t("attendance.attended") : t("attendance.markAttended")}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-5">
        <h3 className="mb-4 text-sm font-bold text-foreground">{t("attendance.statsHeading")}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label={t("attendance.stats.registered")} value={stats?.registered ?? "—"} />
          <StatTile label={t("attendance.stats.confirmed")} value={stats?.confirmed ?? "—"} />
          <StatTile label={t("attendance.stats.attended")} value={stats?.attended ?? "—"} />
          <StatTile label={t("attendance.stats.waitlisted")} value={stats?.waitlisted ?? "—"} />
          <StatTile
            label={t("attendance.stats.awnaSeats")}
            value={stats ? `${stats.awna_seats_used}/${stats.awna_seats}` : "—"}
          />
          <StatTile
            label={t("attendance.stats.seatsRemaining")}
            value={stats?.seats_remaining ?? t("list.unlimited")}
          />
        </div>
      </ChamferedPanel>

      <ChamferedTable
        columns={columns}
        rows={tickets}
        rowKey={(ticket) => ticket.id}
        loading={ticketsQuery.isPending}
        loadingLabel={t("attendance.loading")}
        emptyLabel={t("attendance.empty")}
      />
    </div>
  );
}
