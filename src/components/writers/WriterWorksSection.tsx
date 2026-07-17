"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { Skeleton } from "@/components/ui/Skeleton";
import { FeedArticleCard } from "@/components/feed/FeedArticleCard";
import { useArticles } from "@/hooks/queries/articles";

const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";
const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const ACCENT = "var(--tott-accent-gold)";

function SectionHeader() {
  const t = useTranslations("Writers");
  return (
    <div
      className="flex items-center gap-3 border-b pb-4"
      style={{ borderColor: "var(--tott-card-border)" }}
    >
      <span
        aria-hidden
        className="inline-block shrink-0"
        style={{
          width: 11,
          height: 12,
          backgroundColor: ACCENT,
          clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
        }}
      />
      <span
        className="text-xs font-semibold uppercase tracking-[0.24em]"
        style={{ color: ACCENT, fontFamily: SANS }}
      >
        {t("works.eyebrow")}
      </span>
      <h2
        className="ms-auto text-2xl font-medium sm:text-3xl"
        style={{ color: "var(--tott-home-text-strong)", fontFamily: SERIF }}
      >
        {t("works.title")}
      </h2>
    </div>
  );
}

function WorksSkeleton() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden"
          style={{
            border: "1px solid var(--tott-card-border)",
            borderRadius: 12,
          }}
        >
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Fetches + renders the writer's published works. Only mounts when the writer
 * is linked to a user account (works are queried by author_id = user id). */
function WorksGrid({ userId }: { userId: string }) {
  const q = useArticles({ author: userId, status: "published" });

  // useArticles(...).data is { status, results, data: ArticleListItem[] }.
  const works = q.data?.data ?? [];

  if (q.isPending) return <WorksSkeleton />;

  // Empty or errored — a premium profile shouldn't show "no works yet".
  if (q.isError || works.length === 0) return null;

  return (
    <>
      <SectionHeader />
      <motion.ul
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-10 grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {works.map((article) => (
          <motion.li
            key={article.id}
            variants={staggerChild}
            transition={springs.gentle}
          >
            <FeedArticleCard article={article} />
          </motion.li>
        ))}
      </motion.ul>
    </>
  );
}

export function WriterWorksSection({ userId }: { userId: string | null }) {
  // No linked user → no queryable works. Mount-guard so the hook stays
  // unconditional (useArticles exposes no `enabled`).
  if (!userId) return null;

  return (
    <section className="mx-auto mt-24 max-w-6xl px-6 sm:px-10">
      <WorksGrid userId={userId} />
    </section>
  );
}
