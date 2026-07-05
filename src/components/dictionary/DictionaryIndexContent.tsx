"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { motion } from "motion/react";
import { staggerParent, staggerChild, springs } from "@/lib/motion";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";

export type DictionaryListItem = {
  id: string;
  word: string;
  body: string;
  author: string;
  role: string;
};

export function DictionaryIndexContent({
  entries,
}: {
  entries: DictionaryListItem[];
}) {
  const t = useTranslations("DictionaryEntry");

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div
        className="relative mx-auto w-full px-4 pb-20 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{ maxWidth: "min(92vw, 1100px)" }}
      >
        <header className="mx-auto max-w-2xl text-center">
          <h1
            className="text-3xl font-medium tracking-tight sm:text-4xl"
            style={{ color: TEXT_STRONG }}
          >
            {t("indexTitle")}
          </h1>
          <p className="mt-3 text-sm" style={{ color: TEXT_MUTED }}>
            {t("indexSubtitle")}
          </p>
        </header>

        {entries.length === 0 ? (
          <p
            className="mt-12 text-center text-sm"
            style={{ color: TEXT_MUTED }}
          >
            {t("empty")}
          </p>
        ) : (
          <motion.ul
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {entries.map((d) => (
              <motion.li
                key={d.id}
                className="flex"
                variants={staggerChild}
                transition={springs.gentle}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={`/dictionary/${encodeURIComponent(d.id)}`}
                  className="relative flex w-full flex-col transition-opacity hover:opacity-90"
                  style={{ padding: "24px 28px", gap: 8 }}
                >
                  <ChamferedFrame size={20} borderColor="var(--tott-card-border)" />
                  <h2
                    className="text-xl font-medium tracking-tight"
                    style={{ color: TEXT_STRONG }}
                  >
                    {d.word}
                  </h2>
                  <p
                    className="line-clamp-4 text-sm leading-relaxed"
                    style={{ color: TEXT_MUTED }}
                  >
                    {d.body}
                  </p>
                  {d.author ? (
                    <p
                      className="mt-1 text-sm font-medium"
                      style={{ color: TEXT_STRONG }}
                    >
                      {d.author}
                    </p>
                  ) : null}
                  {d.role ? (
                    <p
                      className="text-xs uppercase"
                      style={{ color: TEXT_MUTED, letterSpacing: "0.04em" }}
                    >
                      {d.role}
                    </p>
                  ) : null}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </main>
  );
}
