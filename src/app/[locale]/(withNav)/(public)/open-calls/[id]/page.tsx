"use client";

import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { HexImageGrid } from "@/components/ui/HexImageGrid";
import { DynamicOpenCallForm } from "@/components/open-call/DynamicOpenCallForm";
import { ContributeIcon } from "@/components/ui/icons";
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
        <Link href="/content" className="text-sm font-medium text-[#C9A96E] hover:underline">
          {t("backToContent")}
        </Link>
      </div>
    );
  }

  if (!openCall) return null;

  const formFields: ApplicationFormField[] = openCall.application_form?.fields?.length
    ? openCall.application_form.fields
    : [];
  const bodySections = articleBlocksToSections(
    (openCall.content_blocks ?? []).map((b) => ({
      block_order: b.order,
      block_type: b.type,
      content: Array.isArray(b.value) ? b.value.join("\n") : (b.value ?? null),
      metadata: null,
    }))
  );

  return (
    <div className="relative min-h-screen w-full" style={{ backgroundColor: theme.pageBackground }}>
      <div className="absolute inset-0">
        <HexBackground />
      </div>

      <div className="relative z-10">
        <section className="flex flex-col items-start lg:flex-row">
          <HexImageGrid className="pl-8 pt-16 lg:pt-20" />

          <div className="flex min-w-0 flex-1 flex-col gap-10 px-6 pt-16 pb-16 sm:px-10 sm:pt-24 sm:pb-24 lg:pl-6 lg:pr-10">
            {/* Meta: category, author, date */}
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

            {/* Application form from open call fields */}
            {formFields.length > 0 && (
              <div
                className="rounded-xl border p-6 sm:p-8"
                style={{
                  backgroundColor: theme.panelBackground,
                  borderColor: theme.cardBorder,
                  color: theme.panelForeground,
                }}
              >
                <DynamicOpenCallForm fields={formFields} />
              </div>
            )}

            {/* Support this trace */}
            <div
              className="flex items-center gap-4 rounded-xl border px-5 py-4"
              style={{
                backgroundColor: theme.panelBackground,
                borderColor: theme.cardBorder,
              }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center"
                style={{
                  clipPath: "polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)",
                  backgroundColor: "#2a2a2a",
                }}
              >
                <span className="text-gray-400" style={{ transform: "scale(0.6)" }}>
                  <ContributeIcon />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">{t("supportTitle")}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  {t("supportDescription")}
                </p>
              </div>
              <Link
                href="/contribute"
                className="shrink-0 rounded-lg px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.accentGold, color: "#1a1a1a" }}
              >
                {t("supportCta")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
