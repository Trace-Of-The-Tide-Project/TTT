"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { theme } from "@/lib/theme";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { type OpenCallListItem } from "@/services/open-calls.service";

export function coverOf(call: OpenCallListItem): string | null {
  const raw = call.cover_image?.trim() || call.main_media?.url?.trim() || null;
  return raw ? resolveArticleMediaSrc(raw) : null;
}

function OpenCallCard({
  call,
  cta,
  featured = false,
}: {
  call: OpenCallListItem;
  cta: string;
  featured?: boolean;
}) {
  const cover = coverOf(call);
  return (
    <Link
      href={`/open-calls/${encodeURIComponent(call.id)}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border transition-colors hover:border-[color:var(--tott-accent-gold)]"
      style={{ borderColor: theme.cardBorder, backgroundColor: "var(--tott-well-bg)" }}
    >
      <div
        className={`relative w-full overflow-hidden ${featured ? "aspect-[16/10]" : "aspect-[16/9]"}`}
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--tott-accent-gold) 14%, var(--tott-well-bg)), var(--tott-well-bg))",
        }}
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(min-width: 1024px) 50vw, 100vw"
            unoptimized
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center opacity-30"
          >
            <span
              className="font-serif text-6xl"
              style={{ color: "var(--tott-accent-gold)" }}
            >
              {call.title?.trim()?.slice(0, 1)?.toUpperCase() || "•"}
            </span>
          </div>
        )}
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--tott-accent-gold) 30%, transparent), transparent 60%)",
          }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        {call.category ? (
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            {call.category}
          </span>
        ) : null}
        <h3
          className={`line-clamp-2 font-serif font-medium group-hover:text-[color:var(--tott-accent-gold)] ${featured ? "text-2xl" : "text-lg"}`}
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {call.title}
        </h3>
        <span
          className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium transition-transform group-hover:translate-x-1"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {cta} →
        </span>
      </div>
    </Link>
  );
}

export function CommunityOpenCalls({ openCalls }: { openCalls: OpenCallListItem[] }) {
  const t = useTranslations("Community");

  return (
    <section className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            className="font-serif text-3xl font-medium"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {t("openCallsHeading")}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
            {t("openCallsSubtitle")}
          </p>
        </div>
        <Link
          href="/open-calls"
          className="shrink-0 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("openCallsAll")}
        </Link>
      </div>

      <motion.div
        className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {openCalls.map((call, i) => (
          <motion.div
            key={call.id}
            className={i === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""}
            variants={staggerChild}
            transition={springs.gentle}
            whileHover={{ y: -4 }}
          >
            <OpenCallCard call={call} cta={t("openCallsCta")} featured={i === 0} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
