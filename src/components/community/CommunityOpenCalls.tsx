"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { theme } from "@/lib/theme";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { type OpenCallListItem } from "@/services/open-calls.service";

function coverOf(call: OpenCallListItem): string | null {
  const raw = call.cover_image?.trim() || call.main_media?.url?.trim() || null;
  return raw ? resolveArticleMediaSrc(raw) : null;
}

function OpenCallCard({
  call,
  cta,
}: {
  call: OpenCallListItem;
  cta: string;
}) {
  const cover = coverOf(call);
  return (
    <Link
      href={`/open-calls/${encodeURIComponent(call.id)}`}
      className="group flex flex-col overflow-hidden rounded-2xl border transition-colors hover:border-[color:var(--tott-accent-gold)]"
      style={{ borderColor: theme.cardBorder, backgroundColor: "var(--tott-well-bg)" }}
    >
      <div className="relative aspect-[16/9] w-full bg-[var(--tott-well-bg)]">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            unoptimized
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {call.category ? (
          <span
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            {call.category}
          </span>
        ) : null}
        <h3
          className="line-clamp-2 text-lg font-medium group-hover:text-[color:var(--tott-accent-gold)]"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {call.title}
        </h3>
        <span
          className="mt-auto pt-2 text-sm font-medium"
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
            className="text-2xl font-medium"
            style={{ color: "var(--tott-home-text-heading)" }}
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
        className="mt-6 grid gap-5 sm:grid-cols-2"
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {openCalls.map((call) => (
          <motion.div
            key={call.id}
            variants={staggerChild}
            transition={springs.gentle}
            whileHover={{ y: -4 }}
          >
            <OpenCallCard call={call} cta={t("openCallsCta")} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
