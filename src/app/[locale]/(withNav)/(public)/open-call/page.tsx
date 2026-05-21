import { useTranslations } from "next-intl";
import { ContributionPageLayout } from "@/components/contribute/ContributionPageLayout";
import { OpenCallForm } from "@/components/open-call/OpenCallForm";
import { theme } from "@/lib/theme";

export default function OpenCallPage() {
  const t = useTranslations("Dashboard.openCallPublic");

  // Article-style header — specific to the open call, so it's passed to the
  // shared layout rather than owned by it.
  const titleBlock = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
        <span
          className="rounded px-2.5 py-0.5 text-xs font-semibold uppercase"
          style={{ backgroundColor: theme.accentGold, color: "#1a1a1a" }}
        >
          Edition
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.accentGold }}
          />
          Author
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.accentGold }}
          />
          Date
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: theme.accentGold }}
          />
          Category
        </span>
      </div>

      <h1 className="text-2xl font-bold leading-snug text-foreground sm:text-3xl">
        British Restrict Jewish Immigration to Palestine
      </h1>

      <div className="space-y-4 text-sm leading-relaxed text-gray-400">
        <p>
          As Great Britain launched the Palestine campaign in 1917 during World War I, and
          its forces were close to conquering Jerusalem, it issued the Balfour Declaration
          that expressed its support for the establishment of a Jewish National Home in
          Palestine. Though Palestinians were relieved that the hardships of the war and the
          Ottoman rule (which had become increasingly unpopular in the years preceding the
          war) will be finally over, they realized at the same time that efforts toward Arab
          independence were being undermined in favor of a system of control that will be
          sanctioned by the League of Nations, will divide the Levant into five entities
          under British or French mandate, and will put, in particular, Palestine under a
          British mandate with the implementation of the Balfour declaration as an integral
          part of the latter.
        </p>
        <p>
          Jewish immigration, though uneven, significantly increased Palestine&apos;s Jewish
          population, and Zionist institutions grew stronger and increasingly entrenched
          within the Mandate&apos;s governing structures. As Palestinian political leaders
          sought to engage the British administration, popular forms of resistance
          periodically erupted into violent clashes, the most significant being the al-Buraq
          Uprising of 1929 and widespread anti-British demonstrations in 1933. By the end of
          1935, Palestine stood poised on the brink of full-blown revolt.
        </p>
      </div>
    </div>
  );

  return (
    <ContributionPageLayout
      titleBlock={titleBlock}
      contentMaxWidth={720}
      support={{
        title: t("supportTitle"),
        description: t("supportDescription"),
        ctaLabel: t("supportCta"),
        ctaHref: "/contribute",
      }}
    >
      <OpenCallForm />
    </ContributionPageLayout>
  );
}
