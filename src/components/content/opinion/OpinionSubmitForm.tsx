"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { dirFor } from "@/i18n/dir";
import { mutationToast } from "@/hooks/useMutationToast";
import { useSubmitOpinionPiece } from "@/hooks/mutations/opinion-submissions";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";

const TITLE_MAX = 300;
const BODY_MAX = 20000;
const BIO_MAX = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = Partial<Record<"title" | "body" | "author_name" | "author_email" | "bio", string>>;

/** FR-OPN-03: public opinion submission form — no auth, hand-rolled validation
 * (project convention: no zod/yup on frontend). */
export default function OpinionSubmitForm() {
  const t = useTranslations("Content.opinion.submit");
  const locale = useLocale();
  const dir = dirFor(locale);
  const submit = useSubmitOpinionPiece();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = t("errorRequired");
    else if (title.length > TITLE_MAX) next.title = t("errorTooLong");
    if (!body.trim()) next.body = t("errorRequired");
    else if (body.length > BODY_MAX) next.body = t("errorTooLong");
    if (!authorName.trim()) next.author_name = t("errorRequired");
    if (!authorEmail.trim() || !EMAIL_RE.test(authorEmail)) next.author_email = t("errorEmail");
    if (bio.length > BIO_MAX) next.bio = t("errorTooLong");
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await mutationToast(
        () =>
          submit.mutateAsync({
            title: title.trim(),
            body: body.trim(),
            author_name: authorName.trim(),
            author_email: authorEmail.trim(),
            bio: bio.trim() || undefined,
            language: locale,
          }),
        { loading: t("submitting"), success: t("success"), error: t("error") },
      );
      setDone(true);
    } catch {
      // toast already surfaced the error
    }
  }

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: theme.homeSurface }}>
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-10">
        <h1 className="font-display text-3xl font-semibold text-foreground">{t("heading")}</h1>
        <p className="mt-2 text-sm text-[var(--tott-home-text-muted)]">{t("subtitle")}</p>

        {done ? (
          <ChamferedSurface
            chamfer={16}
            borderColor="var(--tott-accent-gold)"
            innerFill="var(--tott-elevated)"
            className="mt-8 p-6"
          >
            <p className="text-center text-sm text-[var(--tott-status-emerald)]">{t("success")}</p>
          </ChamferedSurface>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">{t("titleLabel")}</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                dir={dir}
                className="w-full rounded-md border border-[var(--tott-border)] bg-transparent px-3 py-2 text-start text-sm"
                maxLength={TITLE_MAX}
              />
              {errors.title ? <span className="text-xs text-[var(--tott-status-coral)]">{errors.title}</span> : null}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">{t("bodyLabel")}</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                dir={dir}
                rows={12}
                className="w-full rounded-md border border-[var(--tott-border)] bg-transparent px-3 py-2 text-start text-sm"
                maxLength={BODY_MAX}
              />
              {errors.body ? <span className="text-xs text-[var(--tott-status-coral)]">{errors.body}</span> : null}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">{t("authorNameLabel")}</span>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-md border border-[var(--tott-border)] bg-transparent px-3 py-2 text-start text-sm"
              />
              {errors.author_name ? (
                <span className="text-xs text-[var(--tott-status-coral)]">{errors.author_name}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">{t("authorEmailLabel")}</span>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full rounded-md border border-[var(--tott-border)] bg-transparent px-3 py-2 text-start text-sm"
              />
              {errors.author_email ? (
                <span className="text-xs text-[var(--tott-status-coral)]">{errors.author_email}</span>
              ) : null}
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-foreground">{t("bioLabel")}</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                dir={dir}
                rows={3}
                className="w-full rounded-md border border-[var(--tott-border)] bg-transparent px-3 py-2 text-start text-sm"
                maxLength={BIO_MAX}
              />
              {errors.bio ? <span className="text-xs text-[var(--tott-status-coral)]">{errors.bio}</span> : null}
            </label>

            <button
              type="submit"
              disabled={submit.isPending}
              className="mt-2 self-start rounded-md px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--tott-accent-gold)", color: "#000" }}
            >
              {submit.isPending ? t("submitting") : t("submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
