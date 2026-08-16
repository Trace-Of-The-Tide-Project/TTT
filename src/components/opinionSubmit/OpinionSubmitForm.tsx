"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { formatApiError } from "@/lib/api/error-message";
import { useSubmitOpinionPiece } from "@/hooks/mutations/opinion-submissions";

const SUPPORTED_LANGUAGES = ["en", "ar", "es", "fr"] as const;

function toSubmissionLanguage(locale: string): "en" | "ar" | "es" | "fr" {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(locale)
    ? (locale as "en" | "ar" | "es" | "fr")
    : "en";
}

const FIELD_STYLE =
  "w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2 text-sm text-[var(--tott-home-text-strong)] outline-none";
const LABEL_STYLE = "text-start text-sm text-[var(--tott-salt)]";

export function OpinionSubmitForm() {
  const t = useTranslations("OpinionSubmit");
  const locale = useLocale();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [bio, setBio] = useState("");
  const [sent, setSent] = useState(false);

  const submit = useSubmitOpinionPiece();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !authorName.trim() || !authorEmail.trim()) return;
    try {
      await toast.promise(
        submit.mutateAsync({
          title: title.trim(),
          body: body.trim(),
          author_name: authorName.trim(),
          author_email: authorEmail.trim(),
          bio: bio.trim() || undefined,
          language: toSubmissionLanguage(locale),
        }),
        {
          loading: t("sending"),
          success: t("sent"),
          error: (err) =>
            (err as { response?: { status?: number } })?.response?.status === 429
              ? t("rateLimited")
              : formatApiError(err, t("sendFailed")),
        },
      ).unwrap();
      setSent(true);
      setTitle("");
      setBody("");
      setAuthorName("");
      setAuthorEmail("");
      setBio("");
    } catch {
      // toast already surfaced the error
    }
  }

  if (sent) {
    return (
      <ChamferedPanel className="p-6">
        <p className="text-start text-sm text-[var(--tott-status-emerald)]">{t("sent")}</p>
      </ChamferedPanel>
    );
  }

  return (
    <ChamferedPanel className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className={LABEL_STYLE} htmlFor="opinion-title">
            {t("titleLabel")}
          </label>
          <input
            id="opinion-title"
            type="text"
            required
            maxLength={300}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            disabled={submit.isPending}
            className={FIELD_STYLE}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={LABEL_STYLE} htmlFor="opinion-body">
            {t("bodyLabel")}
          </label>
          <textarea
            id="opinion-body"
            required
            maxLength={20000}
            rows={12}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("bodyPlaceholder")}
            disabled={submit.isPending}
            className={FIELD_STYLE}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className={LABEL_STYLE} htmlFor="opinion-author-name">
              {t("authorNameLabel")}
            </label>
            <input
              id="opinion-author-name"
              type="text"
              required
              maxLength={200}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t("authorNamePlaceholder")}
              disabled={submit.isPending}
              className={FIELD_STYLE}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={LABEL_STYLE} htmlFor="opinion-author-email">
              {t("authorEmailLabel")}
            </label>
            <input
              id="opinion-author-email"
              type="email"
              required
              maxLength={320}
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder={t("authorEmailPlaceholder")}
              disabled={submit.isPending}
              className={FIELD_STYLE}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={LABEL_STYLE} htmlFor="opinion-bio">
            {t("bioLabel")} <span className="text-xs">{t("bioOptional")}</span>
          </label>
          <textarea
            id="opinion-bio"
            maxLength={2000}
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={t("bioPlaceholder")}
            disabled={submit.isPending}
            className={FIELD_STYLE}
          />
        </div>

        <button
          type="submit"
          disabled={
            submit.isPending ||
            !title.trim() ||
            !body.trim() ||
            !authorName.trim() ||
            !authorEmail.trim()
          }
          className="self-start rounded-md bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
        >
          {t("submit")}
        </button>
      </form>
    </ChamferedPanel>
  );
}
