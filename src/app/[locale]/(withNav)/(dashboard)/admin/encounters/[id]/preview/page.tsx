import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EncounterDetailContent } from "@/components/open-encounters/EncounterDetailContent";
import { getEncounterServer } from "@/services/encounters.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminEncounterPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const encounter = await getEncounterServer(id);
  if (!encounter) notFound();

  const t = await getTranslations("Dashboard.encounters");

  return (
    <div className="my-4 mx-4 sm:mx-10">
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/admin/encounters"
          className="rounded-md border border-[var(--tott-card-border)] px-3 py-1.5 text-sm text-[var(--tott-muted)] hover:text-foreground"
        >
          ← {t("form.backToList")}
        </Link>
        <span className="text-xs uppercase tracking-wide text-[var(--tott-muted)]">
          {t("preview.label")}
        </span>
      </div>
      <EncounterDetailContent encounter={encounter} />
    </div>
  );
}