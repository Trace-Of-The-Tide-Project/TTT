"use client";

/**
 * Direction 03 — Currents
 * Full-bleed hero with animated tide wave, 4-col portal tiles, manifesto blockquote.
 */
import { Link } from "@/i18n/navigation";
import type { HomeData } from "@/lib/home/fetch-home-data";

const GOLD = "#c9a96e";
const TEAL = "#6db3ae";
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

const PORTALS = [
  { num: "01", labelEn: "Read", labelAr: "اقرأ", descEn: "Articles & magazine issues", descAr: "مقالات وأعداد المجلة", href: "/content", gold: false },
  { num: "02", labelEn: "Write", labelAr: "اكتب", descEn: "Workshops, residency & encounters", descAr: "ورش وإقامات ولقاءات", href: "/writing-room", gold: false },
  { num: "03", labelEn: "Collect", labelAr: "اقتنِ", descEn: "The book library & collections", descAr: "مكتبة الكتب والمجموعات", href: "/books", gold: false },
  { num: "04", labelEn: "Contribute", labelAr: "ساهم", descEn: "Share your story & fund issues", descAr: "شارك قصتك وادعم الأعداد", href: "/contribute", gold: true },
];

export function HomeD03({
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

  const heroImage = data.spotlight?.image ?? null;
  const contributeHref = data.primaryOpenCall?.href ?? "/contribute";

  const portalImages = [
    data.issues[0]?.image ?? null,
    data.trips[0]?.image ?? null,
    data.collections[0]?.image ?? null,
    data.primaryOpenCall?.image ?? null,
  ];

  return (
    <div style={{ background: BG, color: "#e8e4de", fontFamily: "'IBM Plex Sans', sans-serif", minHeight: "100vh" }}>

      {/* FULL-BLEED HERO */}
      <section style={{ position: "relative", height: 660, overflow: "hidden" }}>
        {/* Hero image */}
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt=""
            aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.08) brightness(0.62)" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "#0e0e0e" }} />
        )}
        {/* Radial gradient overlay */}
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 40%, rgba(23,23,23,0.25) 0%, rgba(23,23,23,0.82) 70%)" }} />

        {/* Hero content */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 64px", zIndex: 5 }}>
          {/* Eyebrow with rule lines */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <div style={{ width: 56, height: 1, background: `linear-gradient(to right, transparent, ${GOLD})` }} />
            <span style={{ fontSize: 11, color: GOLD, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600 }}>
              {t("A living archive", "أرشيف حيّ")}
            </span>
            <div style={{ width: 56, height: 1, background: `linear-gradient(to left, transparent, ${GOLD})` }} />
          </div>
          <h1 style={{ fontSize: 68, fontWeight: 300, lineHeight: 1.08, letterSpacing: "-0.025em", color: "#e8e4de", maxWidth: 860, margin: "0 0 24px" }}>
            {t("Culture lives and breathes ", "الثقافة تعيش وتتنفّس ")}
            <span style={{ color: GOLD }}>{t("with us — passed down like stories.", "معنا — تُورَّث كما تُروى الحكايات.")}</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", maxWidth: 580, lineHeight: 1.75, margin: "0 0 36px" }}>
            {t(
              "We practise knowledge like tending the land — digging, planting, waiting. From this rhythm, Trace of the Tide emerges.",
              "نمارس المعرفة كما نفلح الأرض — نحفر، نزرع، ننتظر. من هذا الإيقاع تولد نصّ المدّ.",
            )}
          </p>
          <div style={{ display: "flex", gap: 14 }}>
            <Link
              href="/content"
              style={{ background: GOLD, color: "#332217", padding: "15px 32px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none" }}
            >
              {t("Begin exploring", "ابدأ الاستكشاف")}
            </Link>
            <Link
              href="/magazine"
              style={{ border: "1px solid rgba(255,255,255,0.25)", color: "#e8e4de", padding: "15px 32px", borderRadius: 8, fontSize: 14, textDecoration: "none" }}
            >
              {t("Latest issue", "آخر إصدار")}
            </Link>
          </div>
        </div>

        {/* Animated tide line */}
        <div
          aria-hidden
          style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: 80, zIndex: 6, animation: "tott-wave 18s linear infinite" }}
        >
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: "50%", height: "100%", display: "inline-block" }}>
            <path d="M0,40 C180,10 360,70 540,40 C720,10 900,70 1080,40 C1260,10 1440,50 1440,40 L1440,80 L0,80 Z" fill={`rgba(109,179,174,0.22)`} />
          </svg>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: "50%", height: "100%", display: "inline-block" }}>
            <path d="M0,40 C180,10 360,70 540,40 C720,10 900,70 1080,40 C1260,10 1440,50 1440,40 L1440,80 L0,80 Z" fill={`rgba(109,179,174,0.22)`} />
          </svg>
        </div>
        <div
          aria-hidden
          style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: 60, zIndex: 7, animation: "tott-wave 22s linear infinite reverse" }}
        >
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: "50%", height: "100%", display: "inline-block" }}>
            <path d="M0,30 C200,55 400,5 600,30 C800,55 1000,5 1200,30 C1320,45 1400,25 1440,30 L1440,60 L0,60 Z" fill={`rgba(201,169,110,0.28)`} />
          </svg>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ width: "50%", height: "100%", display: "inline-block" }}>
            <path d="M0,30 C200,55 400,5 600,30 C800,55 1000,5 1200,30 C1320,45 1400,25 1440,30 L1440,60 L0,60 Z" fill={`rgba(201,169,110,0.28)`} />
          </svg>
        </div>
      </section>

      {/* CSS for wave animation */}
      <style>{`
        @keyframes tott-wave {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      {/* PORTAL TILES */}
      <section style={{ padding: "0 0 80px" }}>
        <div style={{ textAlign: "center", padding: "64px 64px 40px" }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", color: MUTED }}>
            {t("Four ways in", "أربعة أبواب إلى المنصّة")}
          </h2>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 6, opacity: 0.7 }}>
            {t("Choose your door", "اختر بابك")}
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
          {PORTALS.map((portal, i) => (
            <Link
              key={portal.href}
              href={portal.href}
              style={{ textDecoration: "none", display: "block", height: 440, position: "relative", overflow: "hidden", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
            >
              {/* Background image */}
              {portalImages[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portalImages[i]!}
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.04)", transition: "transform 0.5s ease" }}
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, #1a1a1a, #0e0e0e)` }} />
              )}
              {/* Dark gradient */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(23,23,23,0.3) 0%, rgba(23,23,23,0.85) 100%)" }} />
              {/* Number */}
              <span style={{ position: "absolute", top: 24, left: 24, fontSize: 12, color: portal.gold ? GOLD : TEAL, fontWeight: 600, letterSpacing: "0.16em" }}>
                {portal.num}
              </span>
              {/* Bottom content */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 28px" }}>
                <div style={{ fontSize: 26, fontWeight: 300, color: portal.gold ? GOLD : "#e8e4de", marginBottom: 8 }}>
                  {ar ? portal.labelAr : portal.labelEn}
                </div>
                <div style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>
                  {ar ? portal.descAr : portal.descEn}
                </div>
                <span style={{ fontSize: 12, color: portal.gold ? GOLD : TEAL }}>
                  {t("Enter", "ادخل")} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* MANIFESTO QUOTE */}
      <section style={{ background: "#111", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "80px 64px", textAlign: "center" }}>
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <HexMark size={30} />
        </div>
        <blockquote style={{ fontSize: 36, fontWeight: 300, fontStyle: "italic", color: "#e8e4de", maxWidth: 820, margin: "0 auto 24px", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
          &ldquo;{t(
            "Culture is not a luxury — it is the very air through which we understand what it means to be alive.",
            "الثقافة ليست ترفاً — إنها الهواء ذاته الذي نفهم من خلاله معنى أن نكون أحياء.",
          )}&rdquo;
        </blockquote>
        <cite style={{ fontSize: 13, color: MUTED, letterSpacing: "0.1em", fontStyle: "normal" }}>
          — {t("Mai Ahmed, Founder", "مي أحمد، المؤسِّسة")}
        </cite>
      </section>

    </div>
  );
}
