"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EncountersListContent } from "./EncountersListContent";
import { EncounterBookingsContent } from "@/components/dashboard/admin/magazine/EncounterBookingsContent";

type Tab = "encounters" | "bookings";

export function EncountersAdminContent() {
  const t = useTranslations("Dashboard.encounters");
  const [tab, setTab] = useState<Tab>("encounters");

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: "encounters", label: t("tabs.encounters") },
    { id: "bookings", label: t("tabs.bookings") },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
        <p className="text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
      </div>

      <div
        role="tablist"
        aria-label={t("title")}
        className="flex w-fit gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-1"
      >
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
            className={
              tab === tb.id
                ? "rounded-md bg-[var(--tott-accent-gold)] px-4 py-1.5 text-sm font-semibold text-[var(--tott-on-accent)]"
                : "rounded-md px-4 py-1.5 text-sm text-[var(--tott-muted)] hover:text-foreground"
            }
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "encounters" ? <EncountersListContent /> : <EncounterBookingsContent />}
    </div>
  );
}