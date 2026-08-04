"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { SegmentedControl, type SegmentedControlOption } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { WriterPublicationRow } from "@/components/writers/WriterPublicationRow";
import type { ArticleListItem } from "@/services/articles.service";

const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const CARD_BORDER = "var(--tott-card-border)";

type FilterId = "all" | "essay" | "article" | "collection";

function RowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 rounded-lg px-4 py-4 sm:px-5"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <Skeleton className="size-10 shrink-0 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3 w-1/3" />
      </div>
    </div>
  );
}

export function WriterPublicationsList({
  works,
  isPending,
  isError,
}: {
  works: ArticleListItem[];
  isPending: boolean;
  isError: boolean;
}) {
  const t = useTranslations("Writers");
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered =
    filter === "all" ? works : works.filter((a) => a.content_type === filter);

  const options: SegmentedControlOption<FilterId>[] = [
    { id: "all", label: t("publications.filters.all") },
    { id: "essay", label: t("publications.filters.essay") },
    { id: "article", label: t("publications.filters.article") },
    { id: "collection", label: t("publications.filters.collection") },
  ];

  return (
    <section className="mx-auto mt-16 max-w-6xl px-6 sm:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2
          className="text-2xl font-medium sm:text-3xl"
          style={{ color: "var(--tott-home-text-strong)", fontFamily: SERIF }}
        >
          {t("publications.heading", { count: works.length })}
        </h2>
        <div className="w-full sm:max-w-md">
          <SegmentedControl
            options={options}
            value={filter}
            onChange={setFilter}
            ariaLabel={t("publications.heading", { count: works.length })}
          />
        </div>
      </div>

      <div className="mt-6">
        {isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : isError || filtered.length === 0 ? (
          <p
            className="rounded-lg px-5 py-10 text-center text-sm"
            style={{ border: `1px solid ${CARD_BORDER}`, color: "var(--tott-home-text-muted)" }}
          >
            {t("works.empty")}
          </p>
        ) : (
          <motion.ul
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="flex list-none flex-col gap-3"
          >
            {filtered.map((article) => (
              <motion.div key={article.id} variants={staggerChild} transition={springs.gentle}>
                <WriterPublicationRow article={article} />
              </motion.div>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
