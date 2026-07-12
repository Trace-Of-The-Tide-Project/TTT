"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mutationToast } from "@/hooks/useMutationToast";
import { useAdminPageHeroes } from "@/hooks/queries/media-library";
import { useUpdatePageHero } from "@/hooks/mutations/media-library";
import { HeroPickerModal } from "./HeroPickerModal";

const PAGE_LABEL_KEYS = {
  home: "home",
  "content-hub": "contentHub",
  "magazine-landing": "magazineLanding",
  writers: "writers",
  trips: "trips",
  "writing-room": "writingRoom",
} as const;

export function PageHeroesTab() {
  const t = useTranslations("Dashboard.mediaLibrary");
  const heroesQuery = useAdminPageHeroes();
  const updateMutation = useUpdatePageHero();
  const [pickerForPageId, setPickerForPageId] = useState<string | null>(null);

  async function handlePick(pageId: string, storageKey: string) {
    try {
      await mutationToast(
        () => updateMutation.mutateAsync({ pageId, storageKey }),
        { loading: `${t("heroes.replace")}…`, success: t("heroes.updated") },
      );
    } catch {
      // mutationToast already showed the error toast
    }
  }

  async function handleClear(pageId: string) {
    try {
      await mutationToast(
        () => updateMutation.mutateAsync({ pageId, storageKey: "" }),
        { loading: `${t("heroes.clear")}…`, success: t("heroes.cleared") },
      );
    } catch {
      // mutationToast already showed the error toast
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[var(--tott-muted)]">{t("heroes.subtitle")}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {heroesQuery.isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)]"
            >
              <div className="aspect-[16/9] w-full bg-[var(--tott-dash-surface-inset)]" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-2/3 rounded bg-[var(--tott-dash-surface-inset)]" />
                <div className="h-3 w-1/2 rounded bg-[var(--tott-dash-surface-inset)]" />
              </div>
            </div>
          ))}
        {(heroesQuery.data ?? []).map((page) => (
          <div
            key={page.id}
            className="overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)]"
          >
            <div className="relative aspect-[16/9] w-full bg-[var(--tott-dash-surface-inset)]">
              {page.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={page.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--tott-muted)]">
                  {t("heroes.noHero")}
                </div>
              )}
            </div>
            <div className="space-y-2 p-3">
              <p className="text-sm font-semibold text-foreground">
                {t(`heroes.pages.${PAGE_LABEL_KEYS[page.id as keyof typeof PAGE_LABEL_KEYS]}`)}
              </p>
              <p className="text-xs text-[var(--tott-muted)]">
                {page.storageKey ? t("heroes.current") : t("heroes.derivedFrom")}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPickerForPageId(page.id)}
                  className="rounded-lg border border-[var(--tott-card-border)] px-3 py-1.5 text-sm font-medium text-foreground"
                >
                  {t("heroes.replace")}
                </button>
                {page.storageKey ? (
                  <button
                    type="button"
                    onClick={() => handleClear(page.id)}
                    className="rounded-lg border border-[var(--tott-card-border)] px-3 py-1.5 text-sm font-medium text-[var(--tott-muted)]"
                  >
                    {t("heroes.clear")}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        <div className="flex flex-col justify-between gap-2 rounded-lg border border-dashed border-[var(--tott-card-border)] p-4">
          <p className="text-sm text-[var(--tott-muted)]">{t("heroes.communityNotice")}</p>
          <Link
            href="/admin/settings"
            className="text-sm font-medium text-[var(--tott-stat-icon)] hover:underline"
          >
            {t("heroes.communityLinkOut")}
          </Link>
        </div>
      </div>
      <HeroPickerModal
        open={pickerForPageId !== null}
        onClose={() => setPickerForPageId(null)}
        onPick={(key) => {
          if (pickerForPageId) handlePick(pickerForPageId, key);
        }}
      />
    </div>
  );
}
