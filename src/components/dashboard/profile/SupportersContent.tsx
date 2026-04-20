"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";

export type ContributionEntry = {
  id: string;
  initials: string;
  name: string;
  timestamp: string;
  amount: string;
  type: "one-time" | "recurring";
};

const SAMPLE_CONTRIBUTIONS: ContributionEntry[] = [
  { id: "1", initials: "A", name: "Ahmed Sameer", timestamp: "3 mins ago", amount: "$5", type: "one-time" },
  { id: "2", initials: "S", name: "Salma Fathi", timestamp: "6 mins ago", amount: "$100", type: "recurring" },
  { id: "3", initials: "M", name: "Mustafa Khaled", timestamp: "10 mins ago", amount: "$25", type: "recurring" },
  { id: "4", initials: "L", name: "Layla Hassan", timestamp: "15 mins ago", amount: "$50", type: "recurring" },
  { id: "5", initials: "O", name: "Omar Yusuf", timestamp: "22 mins ago", amount: "$10", type: "recurring" },
];

export function SupportersContent() {
  const t = useTranslations("Dashboard.profileSupporters");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "one-time" | "recurring">("all");

  const filters = useMemo(
    () =>
      [
        { id: "all" as const, label: t("filterAll") },
        { id: "one-time" as const, label: t("filterOneTime") },
        { id: "recurring" as const, label: t("filterRecurring") },
      ],
    [t],
  );

  const filteredContributions = SAMPLE_CONTRIBUTIONS.filter((c) => {
    if (selectedFilter === "all") return true;
    return c.type === selectedFilter;
  });

  const typeLabel = (type: ContributionEntry["type"]) =>
    type === "one-time" ? t("typeOneTime") : t("typeRecurring");

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex w-full gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1">
        {filters.map((opt) => {
          const isSelected = opt.id === selectedFilter;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedFilter(opt.id)}
              className={`flex-1 cursor-pointer rounded-md py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {filteredContributions.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                style={{ backgroundColor: theme.accentGoldFocus, color: theme.bgDark }}
              >
                {entry.initials}
              </span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#C9A96E" }}>
                  {entry.name}
                </p>
                <p className="text-xs text-gray-500">{entry.timestamp}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex flex-col items-start sm:items-end">
                <p className="text-sm font-medium" style={{ color: "#C9A96E" }}>
                  {entry.amount}
                </p>
                <p className="text-xs capitalize text-foreground">{typeLabel(entry.type)}</p>
              </div>
              <button
                type="button"
                className="flex cursor-pointer items-center justify-center gap-2 self-start rounded-lg bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
              >
                <MessageSquareIcon />
                {t("thankContributor")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
