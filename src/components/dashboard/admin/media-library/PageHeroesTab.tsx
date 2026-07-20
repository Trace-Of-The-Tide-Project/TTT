"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { mutationToast } from "@/hooks/useMutationToast";
import { useAdminPageHeroes } from "@/hooks/queries/media-library";
import { useUpdatePageHero } from "@/hooks/mutations/media-library";
import { useImageFramings } from "@/hooks/queries/image-framing";
import { useSaveImageFraming } from "@/hooks/mutations/image-framing";
import { framingStyle, type ImageFraming } from "@/lib/image-framing";
import { HeroPickerModal } from "./HeroPickerModal";
import { ImageFramingModal } from "./ImageFramingModal";

/** Framing placement for page heroes. The page id (not the underlying
 * site_settings key) addresses it, because that is what both this tab and the
 * public `getPageHero(id)` readers already hold. */
export const PAGE_HERO_FRAMING_ENTITY = "page_hero";
export const PAGE_HERO_FRAMING_FIELD = "image";

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
  const tFraming = useTranslations("Dashboard.imageFraming");
  const heroesQuery = useAdminPageHeroes();
  const updateMutation = useUpdatePageHero();
  const saveFraming = useSaveImageFraming();
  const [pickerForPageId, setPickerForPageId] = useState<string | null>(null);
  const [framingForPageId, setFramingForPageId] = useState<string | null>(null);

  const heroes = heroesQuery.data ?? [];
  // One request for every hero on the tab, not one per card.
  const framingsQuery = useImageFramings(
    PAGE_HERO_FRAMING_ENTITY,
    heroes.map((h) => h.id),
    PAGE_HERO_FRAMING_FIELD,
  );
  const framingFor = (pageId: string): ImageFraming | undefined =>
    framingsQuery.data?.[pageId]?.[PAGE_HERO_FRAMING_FIELD];

  async function handleFramingApply(pageId: string, framing: ImageFraming | undefined) {
    try {
      await mutationToast(
        () =>
          saveFraming.mutateAsync({
            entityType: PAGE_HERO_FRAMING_ENTITY,
            entityId: pageId,
            field: PAGE_HERO_FRAMING_FIELD,
            framing,
          }),
        { loading: `${tFraming("title")}…`, success: t("heroes.updated") },
      );
    } catch {
      // mutationToast already showed the error toast
    }
  }

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
        {heroes.map((page) => (
          <div
            key={page.id}
            className="overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)]"
          >
            <div className="relative aspect-[16/9] w-full bg-[var(--tott-dash-surface-inset)]">
              {page.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={page.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                  style={framingStyle(framingFor(page.id))}
                />
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
                {page.url ? (
                  <button
                    type="button"
                    onClick={() => setFramingForPageId(page.id)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                      framingFor(page.id)
                        ? "border-[var(--tott-accent-gold)] text-[var(--tott-accent-gold)]"
                        : "border-[var(--tott-card-border)] text-foreground"
                    }`}
                  >
                    {tFraming("adjust")}
                  </button>
                ) : null}
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
      <ImageFramingModal
        open={framingForPageId !== null}
        src={heroes.find((h) => h.id === framingForPageId)?.url ?? ""}
        framing={framingForPageId ? framingFor(framingForPageId) : undefined}
        aspect="16/9"
        onClose={() => setFramingForPageId(null)}
        onApply={(framing) => {
          if (framingForPageId) handleFramingApply(framingForPageId, framing);
        }}
      />
    </div>
  );
}
