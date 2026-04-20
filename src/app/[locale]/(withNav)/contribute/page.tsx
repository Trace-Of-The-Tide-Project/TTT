"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import HexBackground from "@/components/ui/HexBackground";
import { ContributionHexCard } from "@/components/contribute/ContributionHexCard";
import { ContributionForm } from "@/components/contribute/ContributionForm";
import { ContributeIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import {
  contributionTypeSlug,
  isKnownContributionTypeSlug,
} from "@/lib/contributions/contribution-type-i18n";
import {
  CONTRIBUTION_TYPE_ORDER,
  getContributionTypeIcon,
} from "@/lib/contributions/contribution-type-icons";
import {
  fetchContributionTypes,
  type ContributionType,
} from "@/services/contributions.service";

export default function ContributePage() {
  const t = useTranslations("Contribute");
  const tPage = useTranslations("Contribute.page");
  const [types, setTypes] = useState<ContributionType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingTypes(true);
      setTypesError(null);
      try {
        const list = await fetchContributionTypes();
        if (cancelled) return;
        setTypes(list);
        const preferred =
          list.find((ty) => ty.name === "Personal Story")?.id ?? list[0]?.id ?? null;
        setSelectedTypeId(preferred);
      } catch (err) {
        if (cancelled) return;
        setTypesError(err instanceof Error ? err.message : tPage("typesLoadError"));
        setTypes([]);
        setSelectedTypeId(null);
      } finally {
        if (!cancelled) setIsLoadingTypes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tPage]);

  const orderedTypes = useMemo(() => {
    if (!types.length) return [];
    const index = new Map<string, number>();
    CONTRIBUTION_TYPE_ORDER.forEach((n, i) => index.set(n, i));
    return [...types].sort((a, b) => {
      const ai = index.get(a.name as (typeof CONTRIBUTION_TYPE_ORDER)[number]) ?? 999;
      const bi = index.get(b.name as (typeof CONTRIBUTION_TYPE_ORDER)[number]) ?? 999;
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
  }, [types]);

  const typeLabel = (apiName: string) => {
    const slug = contributionTypeSlug(apiName);
    if (!isKnownContributionTypeSlug(slug)) return apiName;
    return (t as (key: string) => string)(`types.${slug}`);
  };

  return (
    <div className="relative min-h-screen w-full" style={{ backgroundColor: theme.pageBackground }}>
      <section className="relative w-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: theme.pageBackground,
          }}
        />
        <div className="absolute inset-0 h-[200px] w-full">
          <HexBackground />
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 pt-16 pb-14 sm:pt-20 sm:pb-16">
          <span className="text-gray-500 dark:text-gray-400">
            <ContributeIcon />
          </span>
          <h1 className="mt-6 text-center text-3xl font-bold text-foreground select-none sm:text-4xl">
            {tPage("title")}
          </h1>
          <p className="mt-6 text-center text-lg font-medium text-gray-600 select-none dark:text-gray-400">
            {tPage("subtitle")}
          </p>
        </div>
      </section>

      <section>
        <div className="flex flex-col items-center gap-0">
          {typesError && (
            <div className="mb-6 w-full max-w-3xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {typesError}
            </div>
          )}

          <div className="flex justify-center gap-0">
            {(isLoadingTypes ? [] : orderedTypes).slice(0, 3).map((ty) => {
              const Icon = getContributionTypeIcon(ty.name);
              return (
                <ContributionHexCard
                  key={ty.id}
                  icon={<Icon />}
                  label={typeLabel(ty.name)}
                  selected={selectedTypeId === ty.id}
                  onClick={() => setSelectedTypeId(ty.id)}
                />
              );
            })}
          </div>
          <div className="flex justify-center gap-0" style={{ marginLeft: "35px" }}>
            {(isLoadingTypes ? [] : orderedTypes).slice(3, 5).map((ty) => {
              const Icon = getContributionTypeIcon(ty.name);
              return (
                <ContributionHexCard
                  key={ty.id}
                  icon={<Icon />}
                  label={typeLabel(ty.name)}
                  selected={selectedTypeId === ty.id}
                  onClick={() => setSelectedTypeId(ty.id)}
                />
              );
            })}
          </div>
          <div className="flex justify-center gap-0">
            {(isLoadingTypes ? [] : orderedTypes).slice(5, 8).map((ty) => {
              const Icon = getContributionTypeIcon(ty.name);
              return (
                <ContributionHexCard
                  key={ty.id}
                  icon={<Icon />}
                  label={typeLabel(ty.name)}
                  selected={selectedTypeId === ty.id}
                  onClick={() => setSelectedTypeId(ty.id)}
                />
              );
            })}
          </div>
          <div className="flex justify-center gap-0" style={{ marginLeft: "150px" }}>
            {(isLoadingTypes ? [] : orderedTypes).slice(8, 9).map((ty) => {
              const Icon = getContributionTypeIcon(ty.name);
              return (
                <ContributionHexCard
                  key={ty.id}
                  icon={<Icon />}
                  label={typeLabel(ty.name)}
                  selected={selectedTypeId === ty.id}
                  onClick={() => setSelectedTypeId(ty.id)}
                />
              );
            })}
          </div>
        </div>

        <section className="pt-12 pb-20">
          <ContributionForm selectedTypeId={selectedTypeId} />
        </section>
      </section>
    </div>
  );
}
