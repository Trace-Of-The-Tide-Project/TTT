"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ContributionPageLayout } from "@/components/contribute/ContributionPageLayout";
import { DynamicOpenCallForm } from "@/components/open-call/DynamicOpenCallForm";
import { ContentArticleBody } from "@/components/content/article/ContentArticleBody";
import { articleBlocksToSections } from "@/lib/content/article-blocks-to-sections";
import { theme } from "@/lib/theme";
import { useOpenCall } from "@/hooks/queries/open-calls";
import type { OpenCallDetail, ApplicationFormField } from "@/services/open-calls.service";

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export default function OpenCallByIdPage() {
  const t = useTranslations("Dashboard.openCallPublic");
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const openCallQuery = useOpenCall(id);
  const openCall: OpenCallDetail | null = openCallQuery.data ?? null;
  const phase: "loading" | "ok" | "missing" | "error" = openCallQuery.isPending
    ? "loading"
    : openCallQuery.error
      ? "error"
      : openCall
        ? "ok"
        : "missing";

  if (phase === "loading") {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm text-gray-500"
        style={{ backgroundColor: theme.pageBackground }}
      >
        {t("loading")}
      </div>
    );
  }

  if (phase === "missing" || phase === "error") {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 text-center text-foreground"
        style={{ backgroundColor: theme.pageBackground }}
      >
        <h1 className="text-xl font-semibold">
          {phase === "missing" ? t("errorNotFoundTitle") : t("errorLoadTitle")}
        </h1>
        <p className="text-sm text-gray-500">
          {phase === "missing" ? t("errorMissingBody") : t("errorLoadBody")}
        </p>
        <Link href="/content" className="text-sm font-medium text-[color:var(--tott-accent-gold)] hover:underline">
          {t("backToContent")}
        </Link>
      </div>
    );
  }

  if (!openCall) return null;

  const formFields: ApplicationFormField[] = openCall.application_form?.fields?.length
    ? openCall.application_form.fields
    : [];
  // Drop inline image figures from the body: the open call's imagery is already
  // shown through the hex mosaic (from main_media), so rendering it again in the
  // article body would duplicate it. Non-image content in each section is kept.
  const bodySections = articleBlocksToSections(
    (openCall.content_blocks ?? []).map((b) => ({
      block_order: b.order,
      block_type: b.type,
      content: Array.isArray(b.value) ? b.value.join("\n") : (b.value ?? null),
      metadata: null,
    }))
  ).map(({ images: _images, ...section }) => section);

  // Article header — data-driven meta row (category tag · author · date), the
  // open call title, and the rendered article body. Passed to the shared
  // contribution layout as the title slot.
  const titleBlock = (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
          {openCall.category && (
            <span
              className="rounded px-2.5 py-0.5 text-xs font-semibold uppercase"
              style={{ backgroundColor: theme.accentGold, color: "#1a1a1a" }}
            >
              {openCall.category}
            </span>
          )}
          {(openCall.creator?.full_name || openCall.creator?.username) && (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: theme.accentGold }}
              />
              {openCall.creator.full_name || openCall.creator.username}
            </span>
          )}
          {(openCall.createdAt || openCall.created_at || openCall.published_at) && (
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: theme.accentGold }}
              />
              {formatDate(
                openCall.createdAt ?? openCall.created_at ?? openCall.published_at,
                locale
              )}
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
          {openCall.title}
        </h1>

        <ContentArticleBody sections={bodySections} />
      </div>
    </div>
  );

  return (
    <ContributionPageLayout
      titleBlock={titleBlock}
      contentMaxWidth={720}
      hexGridSrc={openCall.main_media?.type === "image" ? openCall.main_media.url : undefined}
      support={{
        title: t("supportTitle"),
        description: t("supportDescription"),
        ctaLabel: t("supportCta"),
        ctaHref: "/contribute",
      }}
    >
      {formFields.length > 0 ? (
        <DynamicOpenCallForm fields={formFields} openCallId={openCall.id} />
      ) : null}
    </ContributionPageLayout>
  );
}
