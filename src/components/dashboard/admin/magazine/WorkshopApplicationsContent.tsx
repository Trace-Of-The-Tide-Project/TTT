"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";
import type { WorkshopApplication } from "@/services/workshops.service";
import { useWorkshopApplications } from "@/hooks/queries/workshops-admin";
import { useUpdateWorkshopApplicationStatus } from "@/hooks/mutations/workshops-admin";
import {
  ApplicationReviewList,
  DetailRow,
  DetailBlock,
} from "@/components/dashboard/admin/magazine/ApplicationReviewList";

export function WorkshopApplicationsContent() {
  const t = useTranslations("Dashboard.workshopApplications");
  const query = useWorkshopApplications();
  const update = useUpdateWorkshopApplicationStatus();

  const setStatus = (
    app: WorkshopApplication,
    status: "approved" | "rejected",
  ) => {
    update.mutate(
      { id: app.id, status },
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
    <ApplicationReviewList<WorkshopApplication>
      ns="Dashboard.workshopApplications"
      items={query.data ?? []}
      isLoading={query.isLoading}
      errorMessage={query.error ? formatApiError(query.error, t("list.loadError")) : null}
      onRetry={() => void query.refetch()}
      acting={update.isPending}
      getId={(a) => a.id}
      getStatus={(a) => a.status}
      getPrimary={(a) => a.name}
      getSecondary={(a) => a.workshop_title || a.email}
      getDate={(a) => a.createdAt}
      searchText={(a) =>
        `${a.name} ${a.email} ${a.workshop_title ?? ""} ${a.experience_level ?? ""}`
      }
      detailTitle={(a) => a.name}
      onSetStatus={setStatus}
      renderDetail={(a) => (
        <>
          <DetailRow label={t("detail.workshop")}>
            {a.workshop_title || "—"}
          </DetailRow>
          <DetailRow label={t("detail.email")}>{a.email}</DetailRow>
          <DetailBlock label={t("detail.experienceLevel")}>
            {a.experience_level || "—"}
          </DetailBlock>
        </>
      )}
    />
  );
}
