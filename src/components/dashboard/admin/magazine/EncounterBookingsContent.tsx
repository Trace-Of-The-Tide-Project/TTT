"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";
import type { EncounterBooking } from "@/services/encounters.service";
import { useEncounterBookings } from "@/hooks/queries/encounters-admin";
import { useUpdateEncounterBookingStatus } from "@/hooks/mutations/encounters-admin";
import {
  ApplicationReviewList,
  DetailRow,
  DetailBlock,
} from "@/components/dashboard/admin/magazine/ApplicationReviewList";

export function EncounterBookingsContent() {
  const t = useTranslations("Dashboard.encounterBookings");
  const query = useEncounterBookings();
  const update = useUpdateEncounterBookingStatus();

  const setStatus = (
    b: EncounterBooking,
    status: "approved" | "rejected",
  ) => {
    update.mutate(
      { id: b.id, status },
      {
        onSuccess: () =>
          toast.success(t(status === "approved" ? "toast.approved" : "toast.rejected")),
        onError: (err) =>
          toast.error(
            t(status === "approved" ? "toast.approveError" : "toast.rejectError"),
            { description: formatApiError(err, t("toast.errorBody")) },
          ),
      },
    );
  };

  return (
    <ApplicationReviewList<EncounterBooking>
      ns="Dashboard.encounterBookings"
      items={query.data ?? []}
      isLoading={query.isLoading}
      errorMessage={query.error ? formatApiError(query.error, t("list.loadError")) : null}
      onRetry={() => void query.refetch()}
      acting={update.isPending}
      getId={(b) => b.id}
      getStatus={(b) => b.status}
      getPrimary={(b) => b.name}
      getSecondary={(b) => b.encounter_title || b.email}
      getDate={(b) => b.createdAt}
      searchText={(b) =>
        `${b.name} ${b.email} ${b.encounter_title ?? ""} ${b.message ?? ""}`
      }
      detailTitle={(b) => b.name}
      onSetStatus={setStatus}
      renderDetail={(b) => (
        <>
          <DetailRow label={t("detail.encounter")}>
            {b.encounter_title || "—"}
          </DetailRow>
          <DetailRow label={t("detail.email")}>{b.email}</DetailRow>
          <DetailBlock label={t("detail.message")}>{b.message || "—"}</DetailBlock>
        </>
      )}
    />
  );
}
