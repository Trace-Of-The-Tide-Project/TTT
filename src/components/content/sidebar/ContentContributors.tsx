"use client";

import { useTranslations } from "next-intl";
import { ChevronRightIcon } from "@/components/ui/icons";

type Contributor = {
  name: string;
  role: string;
  initials: string;
  color?: string;
};

type ContentContributorsProps = {
  contributors: Contributor[];
};

export function ContentContributors({
  contributors,
}: ContentContributorsProps) {
  const t = useTranslations("Content");

  return (
    <div>
      <h3 className="text-xl font-medium text-foreground">{t("contributors")}</h3>
      <p className="mt-1 text-xs text-[var(--tott-muted)]">
        {t("contributedCount", { count: contributors.length })}
      </p>

      <ul className="mt-4 space-y-1">
        {contributors.map((c, i) => (
          <li
            key={i}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: c.color || "var(--tott-gold-chip-bg)", color: "var(--tott-gold-chip-ink)" }}
            >
              {c.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--tott-dash-gold-label)]">
                {c.name}
              </p>
              <p className="truncate text-xs text-[var(--tott-muted)]">{c.role}</p>
            </div>
            <span className="shrink-0 text-[var(--tott-muted)]">
              <ChevronRightIcon />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
