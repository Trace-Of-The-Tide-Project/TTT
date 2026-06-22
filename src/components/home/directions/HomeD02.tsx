"use client";
/**
 * Direction 02 — The Tideline
 * Type-forward editorial; centered masthead, lead story, numbered list, stream rows, newsletter.
 */
import { Link } from "@/i18n/navigation";
import type { HomeData } from "@/lib/home/fetch-home-data";

const GOLD = "#c9a96e";
const BG = "#171717";
const MUTED = "#a8a298";

const HexMark = ({ size = 22 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size * 1.15,
      background: GOLD,
      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      flexShrink: 0,
    }}
  />
);

const STREAM_ITEMS = [
  { label: "Magazine", labelAr: "المجلة", desc: "Current & archival issues", descAr: "الأعداد الحالية والأرشيفية", href: "/magazine" },
  { label: "Writing Room", labelAr: "غرفة الكتابة", desc: "Open calls & residencies", descAr: "دعوات مفتوحة وإقامات", href: "/writing-room" },
  { label: "Books", labelAr: "الكتب", desc: "Curated reading selections", descAr: "اختيارات مقروءة منتقاة", href: "/books" },
  { label: "Open Calls", labelAr: "دعوات مفتوحة", desc: "Submit your work", descAr: "قدّم عملك", href: "/open-calls" },
];

export function HomeD02({
  data,
  locale,
  dir,
}: {
  data: HomeData;
  locale: string;
  dir: "ltr" | "rtl";
}) {
  const ar = locale === "ar";
  const t = (en: string, arStr: string) => (ar ? arStr : en);

  const spotlight = data.spotlight;
  const latestThree = data.oralHistories.slice(0, 3);
  const contributeHref = data.primaryOpenCall?.href ?? "/contribute";

  return (
    <div style={{ background: BG, color: "#e8e4de", fontFamily: "'IBM Plex Sans', sans-serif", minHeight: "100vh" }}>

      {/* MASTHEAD DIVIDER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, padding: "14px 64px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ fontSize: 11, color: GOLD, textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 600 }}>
          VOL. IV
        </span>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
        <span style={{ fontSize: 11, color: "#8f897e", textTransform: "uppercase", letterSpacing: "0.22em" }}>
          2026 — MENA
        </span>
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
        <span style={{ fontSize: 11, color: "#8f897e", textTransform: "uppercase", letterSpacing: "0.22em" }}>
          {t("A LIVING ARCHIVE", "أرشيف حيّ")}
        </span>
      </div>

      {/* HERO TEXT */}
      <div style={{ textAlign: "center", padding: "72px 64px 56px", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 76, fontWeight: 300, letterSpacing: "-0.035em", lineHeight: 1.05, color: "#e8e4de", margin: "0 0 24px" }}>
          {t("Culture ", "الثقافة ")}<em style={{ color: GOLD, fontStyle: "italic" }}>{t("is a living conversation,", "حيّةٌ محادثة،")}</em>
          <br />
          {t("not a spectacle.", "لا مشهدٌ يُستهلك.")}
        </h1>
        <p style={{ fontSize: 17, color: MUTED, maxWidth: 560, margin: "0 auto", lineHeight: 1.75 }}>
          {t(
            "A journal exploring the intersection of art, design, cinema, and the cultural forces that define our era — depth over speed, meaning over noise.",
            "مجلة تستكشف تقاطع الفن والتصميم والسينما والقوى الثقافية التي تعرّف عصرنا — العمق على السرعة، المعنى على الضجيج.",
          )}
        </p>
      </div>

      {/* FEATURED ARTICLE */}
      {spotlight ? (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 64px 72px", display: "grid", gridTemplateColumns: "660px 1fr", gap: 56, alignItems: "start" }}>
          <Link href={spotlight.href} style={{ textDecoration: "none", display: "block", position: "relative" }}>
            <div style={{ height: 420, borderRadius: 4, overflow: "hidden", background: "#222", position: "relative" }}>
              {spotlight.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={spotlight.image} alt={spotlight.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05)" }} />
              ) : null}
              <span style={{ position: "absolute", top: 16, left: 16, background: GOLD, color: "#332217", fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 2, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                {t("Lead Story", "القصة الرئيسية")}
              </span>
            </div>
          </Link>
          <div style={{ paddingTop: 8 }}>
            {spotlight.category ? (
              <span style={{ fontSize: 11, color: GOLD, textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 600 }}>{spotlight.category}</span>
            ) : null}
            <Link href={spotlight.href} style={{ textDecoration: "none" }}>
              <h2 style={{ fontSize: 28, fontWeight: 400, lineHeight: 1.25, color: "#e8e4de", margin: "12px 0 16px" }}>{spotlight.title}</h2>
            </Link>
            {spotlight.excerpt ? (
              <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.75, margin: "0 0 24px" }}>{spotlight.excerpt}</p>
            ) : null}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              {spotlight.authorName ? (
                <span style={{ fontSize: 13, color: "#c8c4be" }}>{spotlight.authorName}</span>
              ) : null}
              {spotlight.readingTime ? (
                <>
                  <span style={{ color: "#5a5650" }}>·</span>
                  <span style={{ fontSize: 12, color: MUTED }}>{spotlight.readingTime} {t("min read", "د. قراءة")}</span>
                </>
              ) : null}
            </div>
            <Link href={spotlight.href} style={{ color: GOLD, fontSize: 14, textDecoration: "none", fontWeight: 500 }}>
              {t("Read the full story →", "اقرأ القصة كاملة ←")}
            </Link>
          </div>
        </section>
      ) : null}

      {/* LATEST PUBLISHED */}
      {latestThree.length > 0 ? (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 64px 72px" }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: MUTED, marginBottom: 32 }}>
            {t("Latest Published", "أحدث ما نُشر")}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {latestThree.map((item, i) => {
              const title = item.title;
              const href = item.href;
              const cat = (item as { category?: string | null }).category ?? null;
              return (
                <Link key={item.id} href={href} style={{ textDecoration: "none" }}>
                  <div style={{ fontSize: 30, fontWeight: 300, color: GOLD, lineHeight: 1, marginBottom: 14 }}>
                    0{i + 1}
                  </div>
                  {cat ? (
                    <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 8 }}>{cat}</div>
                  ) : null}
                  <div style={{ fontSize: 17, fontWeight: 400, color: "#e8e4de", lineHeight: 1.4 }}>{title}</div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* EXPLORE THE PLATFORM — stream rows */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 64px 72px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: MUTED, margin: "40px 0 0" }}>
          {t("Explore the platform", "استكشف المنصّة")}
        </h2>
        {STREAM_ITEMS.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            style={{ display: "flex", alignItems: "center", gap: 32, padding: "28px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" }}
          >
            <span style={{ fontSize: 13, color: GOLD, width: 28, flexShrink: 0 }}>0{i + 1}</span>
            <span style={{ fontSize: 22, fontWeight: 300, color: "#e8e4de", width: 280, flexShrink: 0 }}>{ar ? item.labelAr : item.label}</span>
            <span style={{ fontSize: 14, color: MUTED, flex: 1 }}>{ar ? item.descAr : item.desc}</span>
            <span style={{ color: GOLD, fontSize: 18 }}>→</span>
          </Link>
        ))}
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: "#1c1c1c", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "60px 64px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, color: GOLD, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600 }}>
              {t("Newsletter", "النشرة البريدية")}
            </span>
            <h3 style={{ fontSize: 28, fontWeight: 300, color: "#e8e4de", margin: "12px 0 16px", letterSpacing: "-0.02em" }}>
              {t("Join our cultural circle", "انضمّ إلى دائرتنا الثقافية")}
            </h3>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>
              {t(
                "A biweekly dispatch on art, cinema, and design from the Arab world.",
                "رسالةٌ كل أسبوعين عن الفن والسينما والتصميم.",
              )}
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: 12 }}>
            <input
              type="email"
              placeholder={t("Your email address", "بريدك الإلكتروني")}
              dir={dir}
              style={{
                flex: 1, background: "transparent", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 8,
                padding: "14px 18px", fontSize: 14, color: "#e8e4de", outline: "none",
              }}
            />
            <button
              type="submit"
              style={{ background: GOLD, color: "#332217", border: "none", borderRadius: 8, padding: "14px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
            >
              {t("Subscribe", "اشترك")}
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}
