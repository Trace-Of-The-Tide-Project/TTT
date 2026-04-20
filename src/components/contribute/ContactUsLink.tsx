"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeadsetIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";

export function ContactUsLink() {
  const t = useTranslations("Contribute.contact");

  return (
    <p className="mt-8 flex flex-wrap select-none items-center justify-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
      {t("lead")}
      <span
        className="inline-flex shrink-0 align-middle"
        style={{ color: theme.accentGold }}
        aria-hidden
      >
        <HeadsetIcon />
      </span>
      <Link
        href="/contact"
        className="inline-flex select-none hover:underline"
        style={{ color: theme.accentGold }}
      >
        {t("link")}
      </Link>
    </p>
  );
}
