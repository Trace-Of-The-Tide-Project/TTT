"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { mutationToast } from "@/hooks/useMutationToast";
import { useImageFramings } from "@/hooks/queries/image-framing";
import { useSaveImageFraming } from "@/hooks/mutations/image-framing";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import type { ImageFraming } from "@/lib/image-framing";
import { ImageFramingModal } from "./ImageFramingModal";

export type AdjustImageButtonProps = {
  /** Owning table, e.g. "articles". */
  entityType: string;
  /** Row id. Undefined while the record is unsaved — the button hides, since
   * framing is its own row and needs something to attach to. */
  entityId?: string;
  /** Image column, e.g. "cover_image". */
  field: string;
  /** Current image (storage key or URL). Empty hides the button. */
  src: string | null | undefined;
  /** Aspect ratio of the live frame, so the preview is honest. */
  aspect: string;
  className?: string;
};

/**
 * Opens the framing editor for one placement and saves the result.
 *
 * Framing lives in its own table, so it saves on Apply rather than waiting for
 * the surrounding form's Save button — the same behavior as page heroes. That
 * is also why the button hides until the record exists.
 */
export function AdjustImageButton({
  entityType,
  entityId,
  field,
  src,
  aspect,
  className,
}: AdjustImageButtonProps) {
  const t = useTranslations("Dashboard.imageFraming");
  const [open, setOpen] = useState(false);
  const save = useSaveImageFraming();

  const framingsQuery = useImageFramings(entityType, entityId ? [entityId] : [], field);
  const framing = entityId ? framingsQuery.data?.[entityId]?.[field] : undefined;

  const image = (src ?? "").trim();
  if (!entityId || !image) return null;

  const apply = async (next: ImageFraming | undefined) => {
    try {
      await mutationToast(
        () => save.mutateAsync({ entityType, entityId, field, framing: next }),
        { loading: `${t("title")}…`, success: t("saved") },
      );
    } catch {
      // mutationToast already surfaced the error
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ??
          `rounded-lg border px-3 py-1.5 text-sm font-medium ${
            framing
              ? "border-[var(--tott-accent-gold)] text-[var(--tott-accent-gold)]"
              : "border-[var(--tott-card-border)] text-foreground"
          }`
        }
      >
        {t("adjust")}
      </button>
      <ImageFramingModal
        open={open}
        src={resolveArticleMediaSrc(image)}
        framing={framing}
        aspect={aspect}
        onClose={() => setOpen(false)}
        onApply={(next) => void apply(next)}
      />
    </>
  );
}
