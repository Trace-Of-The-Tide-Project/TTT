"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { nameInitials } from "@/components/dashboard/admin/writers/initials";
import { UserPicker } from "@/components/dashboard/admin/writers/UserPicker";
import type { AdminUserListItem } from "@/services/users.service";
import type { ContributorRole } from "@/services/article-contributors.service";
import {
  useAddArticleContributor,
  useArticleContributors,
  useRemoveArticleContributor,
} from "@/hooks/queries/article-contributors";

const ROLES: ContributorRole[] = ["co-author", "editor", "reviewer", "contributor", "main_contributor"];

const FIELD_BASE =
  "w-full rounded-[7.5px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-[var(--tott-card-border)]";

export function ContributorsPanel({ articleId }: { articleId: string }) {
  const t = useTranslations("Dashboard.articles.editor.contributors");
  const { data: contributors = [], isPending } = useArticleContributors(articleId);
  const addMutation = useAddArticleContributor(articleId);
  const removeMutation = useRemoveArticleContributor(articleId);

  const [pickedUser, setPickedUser] = useState<AdminUserListItem | null>(null);
  const [role, setRole] = useState<ContributorRole>("co-author");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!pickedUser) return;
    setError(null);
    try {
      await addMutation.mutateAsync({ user_id: pickedUser.id, role });
      setPickedUser(null);
      setRole("co-author");
    } catch {
      setError(t("addFailed"));
    }
  }

  return (
    <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-4">
      <h3 className="mb-4 text-base font-bold text-foreground">{t("panelTitle")}</h3>
      <div className="flex flex-col gap-3">
        {isPending ? (
          <p className="text-xs text-[var(--tott-muted)]">{t("loading")}</p>
        ) : contributors.length === 0 ? (
          <p className="text-xs text-[var(--tott-muted)]">{t("empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {contributors.map((c) => {
              const name = c.user?.full_name?.trim() || c.user?.username?.trim() || t("unknownUser");
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
                      {nameInitials(name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{name}</p>
                      <p className="truncate text-xs text-[var(--tott-muted)]">
                        {t.has(`roles.${c.role}`) ? t(`roles.${c.role}`) : c.role}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(c.id)}
                    disabled={removeMutation.isPending}
                    className="shrink-0 text-xs text-[var(--tott-gold)] hover:underline disabled:opacity-40"
                  >
                    {t("remove")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-col gap-2 border-t border-[var(--tott-card-border)] pt-3">
          <UserPicker value={pickedUser} onChange={setPickedUser} disabled={addMutation.isPending} />
          {pickedUser ? (
            <div className="flex items-center gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as ContributorRole)}
                className={FIELD_BASE}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {t.has(`roles.${r}`) ? t(`roles.${r}`) : r}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAdd}
                disabled={addMutation.isPending}
                className="shrink-0 rounded-[7.5px] border border-[var(--tott-card-border)] px-3 py-2.5 text-sm text-foreground transition-colors hover:border-[var(--tott-accent-gold)]/50 disabled:opacity-40"
              >
                {addMutation.isPending ? t("adding") : t("add")}
              </button>
            </div>
          ) : null}
          {error ? <p className="text-xs text-red-300">{error}</p> : null}
        </div>
      </div>
    </ChamferedPanel>
  );
}
