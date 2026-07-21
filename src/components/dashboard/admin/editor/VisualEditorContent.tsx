"use client";

import { useTranslations } from "next-intl";
import { CMS_TABS, type CmsTabId } from "./cms-tabs-config";
import { HomePageTab, StaticPagesTab, NavigationsFooterTab, BrandingTab } from "./tabs";
import { useVisualEditorTab } from "./VisualEditorTabContext";

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
  const { activeTab, setActiveTab } = useVisualEditorTab();

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex w-fit gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
        {CMS_TABS.map((tab) => {
          const Icon = tab.icon ?? null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                  : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
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
