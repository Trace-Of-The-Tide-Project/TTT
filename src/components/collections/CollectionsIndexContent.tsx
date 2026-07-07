"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import HexBackground from "@/components/ui/HexBackground";
import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { ContentBreadcrumb } from "@/components/content/related/ContentBreadcrumb";
import { SearchIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { CollectionCard, type CollectionCardData } from "./CollectionCard";

export function CollectionsIndexContent({ collections }: { collections: CollectionCardData[] }) {
  const t = useTranslations("Collections");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [collections, search]);

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: theme.homeSurface }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-28">
        <ContentBreadcrumb items={[{ label: t("breadcrumbRoot") }]} />

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-foreground">{t("indexTitle")}</h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--tott-muted)]">
              {t("indexSubtitle")}
            </p>
          </div>
          <label
            className="flex w-full items-center gap-2 rounded-lg border px-4 py-2.5 sm:w-72"
            style={{ borderColor: theme.cardBorder, backgroundColor: "var(--tott-well-bg)" }}
          >
            <span className="text-[var(--tott-muted)]">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full border-0 bg-transparent p-0 text-sm text-foreground shadow-none outline-none focus:ring-0 placeholder:text-[var(--tott-muted)]"
            />
          </label>
        </div>

        <div className="mt-8 pb-12">
          {collections.length === 0 ? (
            <p
              className="rounded-2xl border p-8 text-center text-sm"
              style={{ borderColor: theme.cardBorder, color: "var(--tott-muted)" }}
            >
              {t("noCollections")}
            </p>
          ) : filtered.length === 0 ? (
            <p
              className="rounded-2xl border p-8 text-center text-sm"
              style={{ borderColor: theme.cardBorder, color: "var(--tott-muted)" }}
            >
              {t("noResults")}
            </p>
          ) : (
            <motion.ul
              className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4"
              variants={staggerParent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {filtered.map((c) => (
                <motion.li
                  key={c.id}
                  variants={staggerChild}
                  transition={springs.gentle}
                  whileHover={{ y: -4 }}
                >
                  <CollectionCard data={c} />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>

      <ShareYourStory surface={theme.homeSurface} />
    </main>
  );
}
