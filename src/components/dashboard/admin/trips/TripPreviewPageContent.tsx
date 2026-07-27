"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTrip } from "@/hooks/queries/trips";
import { resolveFromTrip } from "@/components/dashboard/admin/articles/articles-editor/trip/TripPreviewFormatters";
import { TripPreviewBody } from "@/components/dashboard/admin/articles/articles-editor/trip/TripPreviewBody";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

const ARCHIVE_PATH = "/admin/trips?tab=archive";

function BackChevron() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function BackLink() {
  const t = useTranslations("Dashboard.trips.editor.preview");
  return (
    <Link
      href={ARCHIVE_PATH}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
      style={{ color: "var(--tott-muted)" }}
    >
      <BackChevron />
      {t("backToArchive")}
    </Link>
  );
}

export function TripPreviewPageContent({ tripId }: { tripId: string }) {
  const t = useTranslations("Dashboard.trips.editor.preview");
  const { data: trip, isFetching, isError } = useTrip(tripId);

  if (isFetching && !trip) {
    return (
      <div className="space-y-4">
        <BackLink />
        <SkeletonTable rows={4} cols={2} />
      </div>
    );
  }

  if (!trip || isError) {
    return (
      <div className="space-y-6">
        <BackLink />
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border py-24 text-center"
          style={{ borderColor: "var(--tott-card-border)", background: "var(--tott-dash-surface)" }}
        >
          <h1 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            {t("notFound.heading")}
          </h1>
          <p className="max-w-md text-sm" style={{ color: "var(--tott-muted)" }}>
            {t("notFound.body")}
          </p>
          <Link
            href={ARCHIVE_PATH}
            className="mt-2 inline-flex h-10 items-center justify-center rounded-lg px-4 text-[13px] font-medium"
            style={{ background: "var(--tott-accent-gold)", color: "var(--tott-auth-btn-text)" }}
          >
            {t("notFound.cta")}
          </Link>
        </div>
      </div>
    );
  }

  const resolved = resolveFromTrip(trip);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <BackLink />
      <div
        className="rounded-[20px] border px-4 py-6 sm:px-8 sm:py-8"
        style={{ background: "var(--tott-dash-surface)", borderColor: "var(--tott-card-border)", color: "var(--foreground)" }}
      >
        <TripPreviewBody resolved={resolved} layout="page" />
      </div>
    </div>
  );
}
