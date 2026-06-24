/**
 * Direction 01 — Lattice Refined
 * Hex cluster hero, 5-col platform grid, featured issue strip, contribute CTA.
 */
import { Link } from "@/i18n/navigation";
import type { HomeData } from "@/lib/home/fetch-home-data";

// Theme tokens (defined per theme in globals.css). Never hardcode colors here —
// the home page must follow light / dark / tide like the rest of the site.
const GOLD = "var(--tott-accent-gold)";
const BG = "var(--tott-home-surface)";
const SURFACE = "var(--tott-home-surface)";
const MUTED = "var(--tott-home-text-muted)";
const TEXT = "var(--tott-home-text-strong)";
const CTA_INK = "var(--tott-on-accent)";
/** Subtle theme-aware divider/border. */
const HAIRLINE = "color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)";
const BORDER = "var(--tott-card-border)";

const HexMark = ({ size = 26 }: { size?: number }) => (
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

const HexImg = ({
  src,
  width,
  height,
  alt,
}: {
  src: string | null;
  width: number;
  height: number;
  alt: string;
}) => (
  <div
    style={{
      width,
      height,
      clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
      background: "var(--tott-home-hero-grad-top)",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    {src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.02)" }}
      />
    ) : (
      <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, var(--tott-home-hero-grad-top), var(--tott-home-hero-grad-mid))` }} />
    )}
  </div>
);

const PLATFORM_ITEMS = [
  { label: "Articles", labelAr: "مقالات", desc: "Essays & reportage", descAr: "مقالات وتحقيقات", href: "/content" },
  { label: "Magazine", labelAr: "المجلة", desc: "Issues & features", descAr: "الأعداد والمواد", href: "/magazine" },
  { label: "Writing Room", labelAr: "غرفة الكتابة", desc: "Workshops & residency", descAr: "ورش عمل وإقامات", href: "/writing-room" },
  { label: "Books", labelAr: "الكتب", desc: "Library & reading", descAr: "المكتبة والقراءة", href: "/books" },
  { label: "Open Calls", labelAr: "دعوات مفتوحة", desc: "Submit & fund", descAr: "قدّم وادعم", href: "/open-calls" },
];

export function HomeD01({
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

  const issue = data.issues[0] ?? null;
  const contributeHref = data.primaryOpenCall?.href ?? "/contribute";

  return (
    <div dir={dir} style={{ background: BG, color: TEXT, fontFamily: "'IBM Plex Sans', sans-serif", minHeight: "100vh" }}>

      {/* HERO */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 64px 60px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        {/* Left: copy */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <HexMark size={14} />
            <span style={{ fontSize: 11, fontWeight: 600, color: GOLD, textTransform: "uppercase", letterSpacing: "0.2em" }}>
              {t("A living archive of culture & memory", "أرشيفٌ حيٌّ للثقافة والذاكرة")}
            </span>
          </div>
          <h1 style={{ fontSize: 60, fontWeight: 300, lineHeight: 1.05, letterSpacing: "-0.025em", color: TEXT, margin: "0 0 20px" }}>
            {t("We keep the ", "نحفظ ")}
            <span style={{ color: GOLD }}>{t("trace of every", "أثر كل")}</span>
            {t(" tide.", " مدّ.")}
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: MUTED, maxWidth: 460, margin: "0 0 32px" }}>
            {t(
              "We practise knowledge like tending the land — digging, planting, waiting. Culture lives and breathes with us, passed down like stories. From this rhythm, Trace of the Tide emerges.",
              "نمارس المعرفة كما نفلح الأرض — نحفر، نزرع، ننتظر. الثقافة تعيش وتتنفّس معنا، تُورَّث كما تُروى الحكايات. من هذا الإيقاع تولد نصّ المدّ.",
            )}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <Link
              href="/content"
              style={{ background: GOLD, color: CTA_INK, padding: "14px 28px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
            >
              {t("Explore the archive", "استكشف الأرشيف")}
            </Link>
            <Link
              href={contributeHref}
              style={{ border: `1px solid ${BORDER}`, color: TEXT, padding: "14px 28px", borderRadius: 8, fontSize: 14, textDecoration: "none" }}
            >
              {t("Share your story", "شاركنا قصتك")}
            </Link>
          </div>
        </div>

        {/* Right: hex cluster */}
        <div style={{ position: "relative", height: 420, display: "flex", justifyContent: "center" }}>
          {/* Large center hex */}
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }}>
            <div style={{ position: "relative" }}>
              <HexImg src={data.issues[0]?.image ?? null} width={220} height={254} alt="" />
              {data.issues[0] && (
                <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", textAlign: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, whiteSpace: "nowrap" }}>{data.issues[0].title}</div>
                  <div style={{ fontSize: 10, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>{t("Magazine", "المجلة")}</div>
                </div>
              )}
            </div>
          </div>
          {/* Top-right large hex with spotlight */}
          <div style={{ position: "absolute", top: 0, right: "2%" }}>
            <div style={{ position: "relative" }}>
              <HexImg src={data.spotlight?.image ?? null} width={260} height={300} alt={data.spotlight?.title ?? ""} />
              {data.spotlight && (
                <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", textAlign: "center", pointerEvents: "none", width: "80%" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.spotlight.title}</div>
                  <div style={{ fontSize: 10, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>{t("Essay", "مقال")}</div>
                </div>
              )}
            </div>
          </div>
          {/* Bottom-left small hex */}
          <div style={{ position: "absolute", bottom: 0, left: "4%", opacity: 0.85 }}>
            <div style={{ position: "relative" }}>
              <HexImg src={data.primaryOpenCall?.image ?? null} width={160} height={185} alt="" />
              <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 10, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{t("Open Call", "دعوة مفتوحة")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE THE PLATFORM */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 64px 80px" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em", color: MUTED, marginBottom: 24 }}>
          {t("Explore the platform", "استكشف المنصّة")}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {PLATFORM_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                background: SURFACE, border: `1px solid ${HAIRLINE}`, borderRadius: 12,
                padding: "24px 16px", textDecoration: "none", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 12, color: TEXT, fontSize: 13, fontWeight: 500,
                transition: "border-color 0.2s",
              }}
            >
              <HexMark size={20} />
              <span style={{ fontWeight: 600 }}>{ar ? item.labelAr : item.label}</span>
              <span style={{ fontSize: 12, color: MUTED, textAlign: "center" }}>{ar ? item.descAr : item.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED ISSUE */}
      {issue ? (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 64px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 40, background: SURFACE, borderRadius: 16, overflow: "hidden", border: `1px solid ${HAIRLINE}` }}>
            <div style={{ height: 320, overflow: "hidden" }}>
              {issue.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={issue.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.04)" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "var(--tott-home-hero-grad-top)" }} />
              )}
            </div>
            <div style={{ padding: "40px 40px 40px 0", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
              <span style={{ fontSize: 11, color: GOLD, textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 600 }}>
                {t("Featured Issue", "العدد المميّز")}
              </span>
              <h3 style={{ fontSize: 28, fontWeight: 300, color: TEXT, lineHeight: 1.2, margin: 0 }}>{issue.title}</h3>
              {issue.subtitle && (
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>{issue.subtitle}</p>
              )}
              <Link
                href={issue.href}
                style={{ border: `1px solid ${BORDER}`, color: TEXT, padding: "10px 22px", borderRadius: 8, fontSize: 13, textDecoration: "none", width: "fit-content" }}
              >
                {t("Read issue →", "اقرأ العدد ←")}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* SHARE YOUR STORY CTA */}
      <section style={{ background: BG, borderTop: `1px solid ${HAIRLINE}`, padding: "80px 64px", textAlign: "center" }}>
        {/* Sound-wave / oral-archive icon */}
        <div aria-hidden style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, height: 32, marginBottom: 24 }}>
          {[6, 14, 22, 14, 6].map((h, i) => (
            <div key={i} style={{ width: 3, height: h, background: GOLD, borderRadius: 2 }} />
          ))}
        </div>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 300, color: TEXT, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            {t("Share your story", "شاركنا قصتك")}
          </h2>
          <p style={{ fontSize: 16, color: MUTED, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
            {t(
              "Every story matters. Help us preserve the collective memory by contributing your personal experiences, testimonies, or knowledge of historical events.",
              "كل قصة تهمّ. ساعدنا في الحفاظ على الذاكرة الجماعية بمشاركة تجاربك الشخصية وشهاداتك أو معرفتك بالأحداث التاريخية.",
            )}
          </p>
          <Link
            href={contributeHref}
            style={{ background: GOLD, color: CTA_INK, padding: "16px 36px", borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: "none" }}
          >
            {t("Contribute now", "ساهم الآن")}
          </Link>
        </div>
      </section>

    </div>
  );
}
