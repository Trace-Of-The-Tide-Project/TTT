"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { useClaimInvite } from "@/hooks/mutations/sessions";

export function ClaimInviteContent({ token }: { token: string | null }) {
  const t = useTranslations("Waqamh");
  const claim = useClaimInvite();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || claim.isPending || done) return;
    claim.mutate(token, { onSettled: () => setDone(true) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <section className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 lg:px-8">
      <ChamferedPanel className="p-8">
        <h1 className="font-display text-2xl text-[var(--tott-home-text-warm)]">
          {t("claimTitle")}
        </h1>
        <p className="mt-2 text-sm text-[var(--tott-salt)]">{t("claimSubtitle")}</p>
        <p className="mt-6 text-sm text-[var(--tott-home-text-warm)]">
          {!token
            ? t("claimFailed")
            : claim.isPending
              ? t("claiming")
              : claim.isSuccess
                ? t("claimed")
                : claim.isError
                  ? t("claimFailed")
                  : ""}
        </p>
      </ChamferedPanel>
    </section>
  );
}
