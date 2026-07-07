import { getTranslations } from "next-intl/server";

import { SupportPageLayout } from "@/components/layout/SupportPageLayout";

export default async function TermsPage() {
  const t = await getTranslations("Legal.terms");

  return (
    <SupportPageLayout title={t("title")} subtitle={t("subtitle")}>
      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s1.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s1.body")}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s2.heading")}</h2>
        <p className="mb-4 leading-relaxed text-[color:var(--tott-muted)]">
          {t("s2.intro")}
        </p>
        <ul className="list-disc space-y-2 pl-6 text-[color:var(--tott-muted)]">
          {(["item1", "item2", "item3"] as const).map((key) => (
            <li key={key}>{t(`s2.${key}`)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s3.heading")}</h2>
        <p className="mb-4 leading-relaxed text-[color:var(--tott-muted)]">
          {t("s3.intro")}
        </p>
        <ul className="list-disc space-y-2 pl-6 text-[color:var(--tott-muted)]">
          {(["item1", "item2"] as const).map((key) => (
            <li key={key}>{t(`s3.${key}`)}</li>
          ))}
        </ul>
        <p className="mt-4 leading-relaxed text-[color:var(--tott-muted)]">
          {t("s3.after")}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s4.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s4.body")}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s5.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s5.body")}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s6.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s6.body")}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s7.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s7.body")}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s8.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s8.body")}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s9.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s9.body")}</p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s10.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">
          {t.rich("s10.email", {
            mail: (chunks) => (
              <a
                href="mailto:your-email@example.com"
                className="hover:underline"
                style={{ color: "var(--tott-accent-gold)" }}
              >
                {chunks}
              </a>
            ),
          })}
        </p>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s10.address")}</p>
      </section>
    </SupportPageLayout>
  );
}
