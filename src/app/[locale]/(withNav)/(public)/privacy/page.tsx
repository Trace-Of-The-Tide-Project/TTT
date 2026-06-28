import { getTranslations } from "next-intl/server";

import { SupportPageLayout } from "@/components/layout/SupportPageLayout";

export default async function PrivacyPage() {
  const t = await getTranslations("Legal.privacy");

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
            <li key={key}>
              {t.rich(`s2.${key}`, {
                b: (chunks) => (
                  <strong className="text-foreground">{chunks}</strong>
                ),
              })}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s3.heading")}</h2>
        <p className="mb-4 leading-relaxed text-[color:var(--tott-muted)]">
          {t("s3.intro")}
        </p>
        <ul className="list-disc space-y-2 pl-6 text-[color:var(--tott-muted)]">
          {(["item1", "item2", "item3", "item4"] as const).map((key) => (
            <li key={key}>{t(`s3.${key}`)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s4.heading")}</h2>
        <p className="mb-4 leading-relaxed text-[color:var(--tott-muted)]">
          {t("s4.intro")}
        </p>
        <ul className="list-disc space-y-2 pl-6 text-[color:var(--tott-muted)]">
          {(["item1", "item2", "item3"] as const).map((key) => (
            <li key={key}>{t(`s4.${key}`)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-foreground">{t("s5.heading")}</h2>
        <p className="leading-relaxed text-[color:var(--tott-muted)]">{t("s5.body")}</p>
      </section>
    </SupportPageLayout>
  );
}
