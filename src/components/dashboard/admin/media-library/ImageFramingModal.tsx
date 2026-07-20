"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { coverSrc } from "@/lib/content/article-media-url";
import {
  DEFAULT_FRAMING,
  MAX_ZOOM,
  MIN_ZOOM,
  framingStyle,
  isDefaultFraming,
  type ImageFit,
  type ImageFraming,
} from "@/lib/image-framing";

export type ImageFramingModalProps = {
  open: boolean;
  /** The image being framed. */
  src: string;
  /** Current framing, or undefined for default. */
  framing?: ImageFraming;
  /** CSS aspect-ratio of the LIVE frame this image renders into, e.g. "16/9",
   * "1/1". Supplied by the caller, which is the only place that knows it — the
   * preview is only honest if it matches. */
  aspect: string;
  onClose: () => void;
  /** Receives undefined when the result is default framing, so a no-op
   * adjustment never persists a key. */
  onApply: (framing: ImageFraming | undefined) => void;
};

const ROTATIONS = [0, 90, 180, 270] as const;

/**
 * Adjust how an image sits inside its frame: drag to pan, slider to zoom, plus
 * fit / flip / rotate / reset.
 *
 * The preview is a plain <img>, not next/image — it is transient modal chrome,
 * so there is nothing to optimize and no fill-positioning ceremony to set up.
 * Because pan is stored as a percentage, this small preview shows exactly the
 * crop the full-size frame will show, provided `aspect` matches.
 */
export function ImageFramingModal({
  open,
  src,
  framing,
  aspect,
  onClose,
  onApply,
}: ImageFramingModalProps) {
  const t = useTranslations("Dashboard.imageFraming");
  const [draft, setDraft] = useState<ImageFraming>(framing ?? DEFAULT_FRAMING);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  // The modal stays mounted while closed, so reseed the draft each time it
  // opens — otherwise it reopens holding the previous image's adjustments.
  // Adjusted during render (not in an effect) per the codebase's React 19 rule.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setDraft(framing ?? DEFAULT_FRAMING);
  }

  const set = (patch: Partial<ImageFraming>) => setDraft((d) => ({ ...d, ...patch }));

  // Pointer handling follows the house drag pattern (ContentGalleryPlayer):
  // pointer capture, a start-position ref, and one shared up/cancel handler.
  // No RTL special-casing needed — clientX deltas and object-position X are
  // both physical, so dragging right always moves the image right.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { px: e.clientX, py: e.clientY, x: draft.x, y: draft.y };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!start || !rect || rect.width === 0 || rect.height === 0) return;
    // Dragging right reveals more of the image's left side, which is a LOWER
    // object-position percentage — hence the subtraction.
    // ponytail: linear gain against frame size, not true 1:1 pixel tracking.
    // Exact tracking needs naturalWidth/Height vs frame size; add that only if
    // the drag feels loose in practice.
    const nextX = start.x - ((e.clientX - start.px) / rect.width) * 100;
    const nextY = start.y - ((e.clientY - start.py) / rect.height) * 100;
    set({
      x: Math.min(100, Math.max(0, nextX)),
      y: Math.min(100, Math.max(0, nextY)),
    });
  };

  const endDrag = () => {
    dragStart.current = null;
    setDragging(false);
  };

  const rotateNext = () => {
    const i = ROTATIONS.indexOf((draft.rotate ?? 0) as (typeof ROTATIONS)[number]);
    set({ rotate: ROTATIONS[(i + 1) % ROTATIONS.length] });
  };

  const quarterTurn = draft.rotate === 90 || draft.rotate === 270;

  return (
    <Modal
      open={open}
      title={t("title")}
      onClose={onClose}
      maxWidthClassName="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setDraft(DEFAULT_FRAMING)} className={GHOST_BTN}>
            {t("reset")}
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={GHOST_BTN}>
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(isDefaultFraming(draft) ? undefined : draft);
                onClose();
              }}
              className="rounded-md bg-[var(--tott-accent-gold)] px-4 py-1.5 text-xs font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90"
            >
              {t("apply")}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={dragging ? onPointerMove : undefined}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{ aspectRatio: aspect, touchAction: "none" }}
          className={`relative w-full select-none overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-well-bg)] ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- transient
              modal preview; next/image adds nothing and complicates `fill`. */}
          <img
            src={coverSrc(src)}
            alt=""
            draggable={false}
            className="h-full w-full"
            style={framingStyle(draft)}
          />
        </div>

        <p className="text-xs text-[var(--tott-muted)]">
          {quarterTurn ? t("rotatedHint") : t("dragHint")}
        </p>

        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[var(--tott-muted)]">
            <span>{t("zoom")}</span>
            <span className="font-mono">{draft.zoom.toFixed(2)}×</span>
          </label>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={draft.zoom}
            onChange={(e) => set({ zoom: Number(e.target.value) })}
            className="w-full accent-[var(--tott-accent-gold)]"
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-[var(--tott-muted)]">{t("fit")}</p>
          <SegmentedControl<ImageFit>
            options={[
              { id: "cover", label: t("fill") },
              { id: "contain", label: t("contain") },
            ]}
            value={draft.fit}
            onChange={(fit) => set({ fit })}
            ariaLabel={t("fit")}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => set({ flipH: !draft.flipH })}
            aria-pressed={draft.flipH ?? false}
            className={draft.flipH ? TOGGLE_BTN_ON : TOGGLE_BTN}
          >
            {t("flipH")}
          </button>
          <button
            type="button"
            onClick={() => set({ flipV: !draft.flipV })}
            aria-pressed={draft.flipV ?? false}
            className={draft.flipV ? TOGGLE_BTN_ON : TOGGLE_BTN}
          >
            {t("flipV")}
          </button>
          <button type="button" onClick={rotateNext} className={TOGGLE_BTN}>
            {t("rotate")} · {draft.rotate ?? 0}°
          </button>
        </div>
      </div>
    </Modal>
  );
}

const TOGGLE_BTN =
  "rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[var(--tott-accent-gold)]/60 hover:text-[var(--tott-accent-gold)]";

const TOGGLE_BTN_ON =
  "rounded-md border border-[var(--tott-accent-gold)] bg-[var(--tott-accent-gold)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--tott-accent-gold)]";

const GHOST_BTN =
  "rounded-md px-3 py-1.5 text-xs font-medium text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-surface-inset)] hover:text-foreground";
