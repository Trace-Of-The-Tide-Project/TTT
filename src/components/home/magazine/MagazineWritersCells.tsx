"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HexCover } from "./HexCover";
import { MagazineSection, plainText } from "./MagazineSection";
import type { FollowWriterItem } from "./MagazineEditorialBoard";

const FALLBACK_AVATAR = "/images/image.png";

export type MagazineWritersCellsProps = {
  writers: FollowWriterItem[];
  /** Optional founder quote rendered as a calm closing note. */
  founder?: { quote: string; name: string } | null;
  /** Cap the grid; the rest live behind "view more". Defaults to 8. */
  limit?: number;
};

function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  if (url.startsWith("/")) return true;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Editorial Board / Writers tab — a calm honeycomb of writer cells.
 *
 * Replaces the V2 carousel (scroll-snap, nav arrows, ghost-fade peeks,
 * multi-layer hex masking, role pills, follow buttons) with one quiet
 * idea: each writer is a hex portrait that blooms to colour on hover
 * and links to their profile. Same data, far less chrome.
 */
export function MagazineWritersCells({ writers, founder, limit = 8 }: MagazineWritersCellsProps) {
  const t = useTranslations("Home.magazine.editorialBoard");
  const tTabs = useTranslations("Home.magazine.tabs");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const visible = writers.slice(0, limit);

  return (
    <MagazineSection
      eyebrow={tTabs("editorialBoard")}
      heading={t("writersHeading")}
      subtitle={t("mastheadBody")}
      viewMore={{ label: t("newsletterCta"), href: "/writers" }}
    >
      {visible.length > 0 ? (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-6">
          {visible.map((w, i) => (
            <li
              key={w.id}
              className="max-w-[276px] basis-[calc(50%-0.5rem)] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none sm:basis-[220px]"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transitionDelay: `${Math.min(i, 8) * 60}ms`,
              }}
            >
              <WriterCell writer={w} rolePlaceholder={t("rolePlaceholder")} />
            </li>
          ))}
        </ul>
      ) : null}

      {plainText(founder?.quote) ? (
        <figure className="mx-auto mt-2 max-w-[60ch] text-center">
          <blockquote
            className="text-lg italic leading-snug sm:text-xl"
            style={{ color: "var(--tott-home-text-strong)", margin: 0 }}
          >
            “{plainText(founder?.quote)}”
          </blockquote>
          {founder?.name?.trim() ? (
            <figcaption className="mt-3 text-sm" style={{ color: "var(--tott-accent-gold)" }}>
              {founder.name.trim()}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </MagazineSection>
  );
}

function WriterCell({
  writer,
  rolePlaceholder,
}: {
  writer: FollowWriterItem;
  rolePlaceholder: string;
}) {
  const href = writer.id ? `/writers/${encodeURIComponent(writer.id)}` : "/writing-room";
  const avatar = isValidImageUrl(writer.avatar) ? writer.avatar : FALLBACK_AVATAR;
  const role = writer.role?.trim() || rolePlaceholder;
  const subline = writer.title?.trim() || role;

  return (
    <Link
      href={href}
      aria-label={writer.name}
      className="group flex w-full flex-col items-center rounded-2xl outline-none transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[var(--tott-accent-gold)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--tott-home-surface)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <HexCover src={avatar} alt={writer.name} interactive />

      <div
        className="flex w-full flex-col items-center text-center"
        style={{ padding: "16px 12px 0", gap: 4 }}
      >
        <h3
          className="text-base font-medium leading-snug tracking-tight transition-colors duration-300 group-hover:[color:var(--tott-accent-gold)]"
          style={{ color: "var(--tott-home-text-strong)", margin: 0 }}
        >
          {writer.name}
        </h3>
        <p className="text-xs" style={{ color: "var(--tott-home-text-muted)", margin: 0 }}>
          {subline}
        </p>
      </div>
    </Link>
  );
}
