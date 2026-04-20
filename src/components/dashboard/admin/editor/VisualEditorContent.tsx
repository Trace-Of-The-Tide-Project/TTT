"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CMS_TABS, type CmsTabId } from "./cms-tabs-config";
import { HomePageTab, StaticPagesTab, NavigationsFooterTab, BrandingTab } from "./tabs";

function TabContent({ activeTab }: { activeTab: CmsTabId }) {
  switch (activeTab) {
    case "static":
      return <StaticPagesTab />;
    case "nav":
      return <NavigationsFooterTab />;
    case "branding":
      return <BrandingTab />;
    case "home":
    default:
      return <HomePageTab />;
  }
}

export function VisualEditorContent() {
  const t = useTranslations("Dashboard.cmsEditor");
  const [activeTab, setActiveTab] = useState<CmsTabId>("home");

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex w-fit gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1">
        {CMS_TABS.map((tab) => {
          const Icon = tab.icon ?? null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                  : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
              }`}
            >
              {Icon && (
                <span className={`${activeTab === tab.id ? "opacity-100" : "opacity-70"} [&_svg]:h-4 [&_svg]:w-4`}>
                  <Icon />
                </span>
              )}
              {t(`tabs.${tab.id}`)}
            </button>
          );
        })}
      </div>

      <TabContent activeTab={activeTab} />
    </div>
  );
}
