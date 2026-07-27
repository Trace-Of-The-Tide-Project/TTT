"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";
import type { TripListItem } from "@/services/trips.service";
import { editorStopToPreview, resolveFromTrip, type ResolvedTripPreview } from "./TripPreviewFormatters";
import { TripPreviewBody } from "./TripPreviewBody";
import type { EditorStop } from "./ItineraryBuilder";

type TripPreviewData = {
  title: string;
  description: string;
  moderatorName: string;
  category: string;
  difficulty: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  maxParticipants: number;
  minParticipants: number;
  price: string;
  currency: string;
  languages: string[];
  highlights: string[];
  stops: EditorStop[];
  status?: string;
};

type TripPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  data?: TripPreviewData;
  trip?: TripListItem;
};

export function TripPreviewModal({ open, onClose, data, trip }: TripPreviewModalProps) {
  const t = useTranslations("Dashboard.trips.editor.preview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const resolved: ResolvedTripPreview | null = useMemo(() => {
    if (data) {
      return {
        title: data.title,
        description: data.description,
        moderatorName: data.moderatorName,
        category: data.category,
        difficulty: data.difficulty,
        startDate: data.startDate,
        endDate: data.endDate,
        durationHours: data.durationHours,
        maxParticipants: data.maxParticipants,
        minParticipants: data.minParticipants,
        price: data.price,
        currency: data.currency,
        priceCapFromApi: null,
        languages: data.languages,
        highlights: data.highlights,
        stops: data.stops.map(editorStopToPreview),
        routeSummary: null,
        tripStatus: undefined,
        dataStatus: data.status,
      };
    }
    if (trip) return resolveFromTrip(trip);
    return null;
  }, [data, trip]);

  if (!open || !resolved || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button type="button" className="absolute inset-0 bg-black/45 backdrop-blur-md" onClick={onClose} aria-label={t("close")} />

      <div
        className="relative flex max-h-[94vh] w-full max-w-[757px] flex-col overflow-hidden rounded-[20px] border shadow-2xl"
        style={{ background: "var(--tott-dash-surface)", borderColor: "var(--tott-card-border)", color: "var(--foreground)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-preview-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 z-10 rounded-md p-1.5 transition-colors sm:end-5 sm:top-5"
          style={{ color: "var(--tott-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--tott-elevated)"; e.currentTarget.style.color = "var(--foreground)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--tott-muted)"; }}
          aria-label={t("close")}
        >
          <XIcon />
        </button>

        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-5 sm:px-7">
          <TripPreviewBody resolved={resolved} layout="modal" />
        </div>

        <div
          className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t px-4 py-4 sm:px-7"
          style={{ borderColor: "var(--tott-card-border)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 min-w-[78px] items-center justify-center rounded-lg px-4 text-[13px] font-medium transition-colors"
            style={{ background: "var(--tott-dash-control-bg)", color: "var(--tott-dash-control-fg)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--tott-dash-control-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--tott-dash-control-bg)"; }}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
