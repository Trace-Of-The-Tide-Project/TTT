import { getTranslations } from "next-intl/server";

import { SupportPageLayout } from "@/components/layout/SupportPageLayout";
import { Link } from "@/i18n/navigation";

const CONTACT_EMAIL = "director@traceofthetides.org";

export default async function ContactPage() {
  const t = await getTranslations("Legal.contact");

  return (
    <SupportPageLayout title={t("title")} subtitle={t("subtitle")}>
      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">
          {t("getInTouch.heading")}
        </h2>
        <p className="mb-4 leading-relaxed text-[color:var(--tott-muted)]">
          {t("getInTouch.body")}
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {CONTACT_EMAIL}
        </a>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">
          {t("contribute.heading")}
        </h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">
          {t.rich("contribute.body", {
            link: (chunks) => (
              <Link
                href="/contribute"
                className="hover:underline"
                style={{ color: "var(--tott-accent-gold)" }}
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </section>
    </SupportPageLayout>
  );
}
