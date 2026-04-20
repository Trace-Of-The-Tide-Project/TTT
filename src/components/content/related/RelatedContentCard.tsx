"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import { Grid2x2Icon, PersonIcon, CalendarIcon } from "@/components/ui/icons";

const HEX_CLIP =
  "polygon(47.5% 5.67%, 48.29% 5.3%, 49.13% 5.08%, 50% 5%, 50.87% 5.08%, 51.71% 5.3%, 52.5% 5.67%, 87.14% 25.67%, 87.85% 26.17%, 88.47% 26.79%, 88.97% 27.5%, 89.34% 28.29%, 89.57% 29.13%, 89.64% 30%, 89.64% 70%, 89.57% 70.87%, 89.34% 71.71%, 88.97% 72.5%, 88.47% 73.21%, 87.85% 73.83%, 87.14% 74.33%, 52.5% 94.33%, 51.71% 94.7%, 50.87% 94.92%, 50% 95%, 49.13% 94.92%, 48.29% 94.7%, 47.5% 94.33%, 12.86% 74.33%, 12.15% 73.83%, 11.53% 73.21%, 11.03% 72.5%, 10.66% 71.71%, 10.43% 70.87%, 10.36% 70%, 10.36% 30%, 10.43% 29.13%, 10.66% 28.29%, 11.03% 27.5%, 11.53% 26.79%, 12.15% 26.17%, 12.86% 25.67%)";

export type RelatedContentCardData = {
  image: string;
  title: string;
  author: string;
  date: string;
  edition: string;
  href?: string;
};

const HEX_W = 290;
const HEX_H = 280;

export function RelatedContentCard({
  image,
  title,
  author,
  date,
  edition,
  href = "#",
}: RelatedContentCardData) {
  const [hovered, setHovered] = useState(false);

  const card = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative m-0 flex shrink-0 cursor-pointer p-0 transition-all duration-200"
      style={{ width: HEX_W }}
    >
      <div
        className="relative overflow-hidden transition-all duration-200"
        style={{
          width: HEX_W,
          height: HEX_H,
          clipPath: HEX_CLIP,
          boxShadow: hovered
            ? "0 0 0 1px rgba(255,255,255,0.5), 0 0 16px rgba(255,255,255,0.15)"
            : "none",
        }}
      >
        {/* Full image background */}
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover opacity-85 transition-opacity duration-200 group-hover:opacity-95"
          style={{ filter: "grayscale(60%)" }}
          sizes="276px"
        />
        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)",
          }}
        />
        <span className="absolute right-3 top-3 text-gray-400 [&_svg]:h-4 [&_svg]:w-4">
          <Grid2x2Icon />
        </span>
        {/* Content overlay - inside hexagon, on top of image (extra padding for hexagon clip edges) */}
        <div className="absolute inset-x-0 bottom-0 flex min-w-0 flex-col gap-1.5 overflow-hidden px-12 pb-8 pt-4">
          <p className="truncate text-base font-bold leading-tight text-white">{title}</p>
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-white">
            <span className="flex min-w-0 shrink items-center gap-1">
              <span
                className="inline-flex shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5"
                style={{ color: theme.accentGold }}
              >
                <PersonIcon />
              </span>
              <span className="truncate">{author}</span>
            </span>
            <span className="flex min-w-0 shrink items-center gap-1">
              <span
                className="inline-flex shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5"
                style={{ color: theme.accentGold }}
              >
                <CalendarIcon />
              </span>
              <span className="truncate">{date}</span>
            </span>
          </div>
          <span className="mt-2 inline-flex w-fit self-center rounded border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {edition}
          </span>
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block m-0 shrink-0 p-0 -mr-12 last:mr-0">
      {card}
    </Link>
  ) : (
    card
  );
}
