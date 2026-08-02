"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useFormatter } from "next-intl";
import { motion } from "motion/react";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import {
  CalendarIcon,
  MapPinIcon,
  EmailIcon,
  LinkIcon,
  MoreDotsIcon,
} from "@/components/ui/icons";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { FollowButton } from "@/components/writers/FollowButton";
import type { WriterDetailView } from "@/components/writers/WriterDetailContent";
import { framingStyle } from "@/lib/image-framing";

const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";
const CARD_BORDER = "var(--tott-card-border)";
const MUTED = "var(--tott-home-text-muted)";

function MetaItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm"
      style={{ color: MUTED, fontFamily: SANS }}
    >
      <span aria-hidden style={{ color: MUTED }}>
        {icon}
      </span>
      {children}
    </span>
  );
}

export function WriterProfileHero({ writer }: { writer: WriterDetailView }) {
  const t = useTranslations("Writers");
  const format = useFormatter();
  const [menuOpen, setMenuOpen] = useState(false);
  const initial = (writer.name || "?").trim().charAt(0).toUpperCase();

  const joinedLabel = writer.joinedAt
    ? t("hero.joined", {
        date: format.dateTime(new Date(writer.joinedAt), {
          year: "numeric",
          month: "long",
        }),
      })
    : null;

  return (
    <section className="relative">
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 sm:px-10 sm:pt-28">
        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start gap-6 sm:flex-row sm:items-start sm:gap-6"
        >
          {/* Avatar — 72px round */}
          <motion.div
            variants={staggerChild}
            transition={springs.gentle}
            className="relative size-[72px] shrink-0 overflow-hidden rounded-full"
            style={{ border: `1px solid ${CARD_BORDER}` }}
          >
            {writer.avatar ? (
              <Image
                src={writer.avatar}
                alt=""
                fill
                sizes="72px"
                unoptimized
                className="select-none object-cover"
                style={framingStyle(writer.avatarFraming)}
                draggable={false}
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{
                  background:
                    "color-mix(in srgb, var(--tott-accent-gold) 14%, var(--tott-home-surface))",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: 28,
                    lineHeight: 1,
                    color: "var(--tott-home-text-strong)",
                    opacity: 0.8,
                  }}
                >
                  {initial}
                </span>
              </div>
            )}
          </motion.div>

          {/* Editorial block */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <motion.h1
                  variants={staggerChild}
                  transition={springs.gentle}
                  className="text-[2rem] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[2.25rem]"
                  style={{ fontFamily: SERIF, overflowWrap: "anywhere" }}
                >
                  <FirstWordGold raw={writer.name} />
                </motion.h1>

                {writer.headline || writer.bio ? (
                  <motion.p
                    variants={staggerChild}
                    transition={springs.gentle}
                    className="mt-2 max-w-2xl text-sm leading-relaxed sm:text-base"
                    style={{ color: MUTED, fontFamily: SANS }}
                  >
                    {writer.headline || writer.bio}
                  </motion.p>
                ) : null}

                <motion.div
                  variants={staggerChild}
                  transition={springs.gentle}
                  className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5"
                >
                  {joinedLabel ? (
                    <MetaItem icon={<CalendarIcon />}>{joinedLabel}</MetaItem>
                  ) : null}
                  {writer.location ? (
                    <MetaItem icon={<MapPinIcon />}>{writer.location}</MetaItem>
                  ) : null}
                  {writer.email ? (
                    <MetaItem icon={<EmailIcon />}>
                      <a
                        href={`mailto:${writer.email}`}
                        className="hover:opacity-80"
                      >
                        {writer.email}
                      </a>
                    </MetaItem>
                  ) : null}
                  {writer.externalLink ? (
                    <MetaItem icon={<LinkIcon />}>
                      <a
                        href={writer.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80"
                      >
                        {writer.externalLink.replace(/^https?:\/\//, "")}
                      </a>
                    </MetaItem>
                  ) : null}
                </motion.div>
              </div>

              {/* Actions */}
              <motion.div
                variants={staggerChild}
                transition={springs.gentle}
                className="flex shrink-0 items-center gap-2 sm:mt-1"
              >
                <div className="relative">
                  <button
                    type="button"
                    aria-label={t("hero.menu")}
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                    className="inline-flex size-10 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
                    style={{ border: `1px solid ${CARD_BORDER}`, color: MUTED }}
                  >
                    <MoreDotsIcon />
                  </button>
                  {menuOpen ? (
                    <div
                      role="menu"
                      className="absolute end-0 top-12 z-20 min-w-[160px] overflow-hidden rounded-lg"
                      style={{
                        border: `1px solid ${CARD_BORDER}`,
                        backgroundColor: "var(--tott-elevated)",
                      }}
                    >
                      <a
                        role="menuitem"
                        href="#support-panel"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 text-start text-sm transition-colors hover:opacity-80"
                        style={{ color: "var(--tott-home-text-strong)" }}
                      >
                        {t("hero.support")}
                      </a>
                    </div>
                  ) : null}
                </div>

                <a
                  href="#support-panel"
                  className="inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    border: `1px solid ${CARD_BORDER}`,
                    color: "var(--tott-home-text-strong)",
                  }}
                >
                  {t("hero.support")}
                </a>

                {writer.userId ? <FollowButton targetUserId={writer.userId} /> : null}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
