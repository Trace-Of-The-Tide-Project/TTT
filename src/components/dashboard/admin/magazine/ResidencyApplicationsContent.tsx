"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";
import type { ResidencyApplication } from "@/services/residency.service";
import { useResidencyApplications } from "@/hooks/queries/residency";
import { useUpdateResidencyApplicationStatus } from "@/hooks/mutations/residency";
import {
  ApplicationReviewList,
  DetailRow,
  DetailBlock,
} from "@/components/dashboard/admin/magazine/ApplicationReviewList";

export function ResidencyApplicationsContent() {
  const t = useTranslations("Dashboard.residency");
  const query = useResidencyApplications();
  const update = useUpdateResidencyApplicationStatus();

  const setStatus = (app: ResidencyApplication, status: "approved" | "rejected") => {
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
    <ApplicationReviewList<ResidencyApplication>
      ns="Dashboard.residency"
      items={query.data ?? []}
      isLoading={query.isLoading}
      errorMessage={query.error ? formatApiError(query.error, t("list.loadError")) : null}
      onRetry={() => void query.refetch()}
      acting={update.isPending}
      getId={(a) => a.id}
      getStatus={(a) => a.status}
      getPrimary={(a) => a.name}
      getSecondary={(a) => a.email}
      getDate={(a) => a.createdAt}
      searchText={(a) => `${a.name} ${a.email} ${a.working_on ?? ""}`}
      detailTitle={(a) => a.name}
      onSetStatus={setStatus}
      renderDetail={(a) => (
        <>
          <DetailRow label={t("detail.email")}>{a.email}</DetailRow>
          <DetailBlock label={t("detail.whyJoin")}>{a.why_join || "—"}</DetailBlock>
          <DetailBlock label={t("detail.workingOn")}>{a.working_on || "—"}</DetailBlock>
        </>
      )}
    />
  );
}
