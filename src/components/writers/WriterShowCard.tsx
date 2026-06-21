"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import { FollowButton } from "./FollowButton";

const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

export type WriterShowCardData = {
  id: string;
  /** The *user* id the follow points at (writer profiles wrap a user). */
  userId: string | null;
  name: string;
  headline: string | null;
  avatar: string | null;
  themes: string[];
};

/**
 * Discovery card for the public `/writers` show page. Leads with avatar,
 * name, headline and theme pills; the whole card links to the writer
 * detail page while the inline FollowButton stops propagation so a follow
 * click doesn't also navigate. No follower/work counts here — the list
 * endpoint doesn't return them (only `profile-full` does, per-writer).
 */
export function WriterShowCard({ data }: { data: WriterShowCardData }) {
  const initial = (data.name || "?").slice(0, 1).toUpperCase();
  const themes = data.themes.slice(0, 3);

  return (
    <Link
      href={`/writers/${encodeURIComponent(data.id)}`}
      className="group relative flex h-full flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-1"
      style={{
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 16,
        backgroundColor: "var(--tott-well-bg)",
      }}
    >
      {/* Gold border-bleed on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          borderRadius: 16,
          border: "1px solid var(--tott-accent-gold)",
          boxShadow:
            "0 0 0 1px color-mix(in srgb, var(--tott-accent-gold) 35%, transparent), 0 12px 30px -12px color-mix(in srgb, var(--tott-accent-gold) 45%, transparent)",
        }}
      />

      <div className="flex items-start gap-4">
        {data.avatar ? (
          <Image
            src={data.avatar}
            alt=""
            width={64}
            height={64}
            // External signed GCS URL — bypass the Next optimizer (it 502s on
            // these); load directly.
            unoptimized
            className="select-none object-cover"
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              border: `1px solid ${theme.cardBorder}`,
            }}
            draggable={false}
          />
        ) : (
          <span
            className="flex select-none items-center justify-center"
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "var(--tott-accent-gold)",
              color: "var(--tott-on-accent)",
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 600,
              fontSize: 24,
            }}
          >
            {initial}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-base font-medium"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {data.name}
          </p>
          {data.headline ? (
            <p
              className="mt-1 line-clamp-2 text-sm"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {data.headline}
            </p>
          ) : null}
        </div>
      </div>

      {themes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {themes.map((th) => (
            <span
              key={th}
              className="inline-flex items-center"
              style={{
                padding: "4px 10px",
                fontSize: 11,
                lineHeight: "16px",
                color: "var(--tott-home-text-heading)",
                border: `1px solid ${theme.cardBorder}`,
                clipPath: CHIP_CHAMFER,
                WebkitClipPath: CHIP_CHAMFER,
              }}
            >
              {th}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className="mt-auto"
        onClick={(e) => {
          // The follow button manages its own action; don't let a click on it
          // bubble up to the card's navigation Link.
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <FollowButton targetUserId={data.userId} size="sm" />
      </div>
    </Link>
  );
}
