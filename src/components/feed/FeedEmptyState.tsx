import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function FeedEmptyState() {
  const t = useTranslations("Feed");

  return (
    <div
      className="flex flex-col items-start gap-3 p-8"
      style={{ border: "1px solid var(--tott-card-border)", borderRadius: 12 }}
    >
      <h2 className="text-lg font-medium" style={{ color: "var(--tott-home-text-strong)" }}>
        {t("emptyTitle")}
      </h2>
      <p className="text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
        {t("emptyBody")}
      </p>
      <div className="mt-1 flex flex-wrap gap-3">
        <Link
          href="/writers"
          className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            backgroundColor: "var(--tott-magazine-btn-bg)",
            color: "var(--tott-auth-btn-text)",
          }}
        >
          {t("emptyCta")}
        </Link>
        <Link
          href="/magazine"
          className="inline-flex items-center justify-center transition-colors hover:opacity-90"
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            fontWeight: 500,
            fontSize: 14,
            border: "1px solid var(--tott-card-border)",
            color: "var(--tott-home-text-strong)",
          }}
        >
          {t("emptyCtaMagazine")}
        </Link>
      </div>
    </div>
  );
}
