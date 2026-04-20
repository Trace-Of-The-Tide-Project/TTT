"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isAxiosError } from "axios";
import { type ArticleWorkflowStatus } from "../ArticleSettings";
import { ContentEditorFooter } from "../ContentEditorFooter";
import { ScheduleArticleModal } from "../modals/ScheduleArticleModal";
import { TripBasicInfo } from "./TripBasicInfo";
import { TripDetailsSection } from "./TripDetailsSection";
import { TripPricing } from "./TripPricing";
import { TripLanguages } from "./TripLanguages";
import { ItineraryBuilder, emptyEditorStop, editorStopsToTripStops, type EditorStop } from "./ItineraryBuilder";
import { TripSummary } from "./TripSummary";
import { TripPreviewModal } from "./TripPreviewModal";
import { isEndDatetimeBeforeStart } from "@/lib/datetime-local";
import { ApplicationFormBuilder } from "../open-call/ApplicationFormBuilder";
import {
  DEFAULT_TRIP_BOOKING_FORM_FIELDS,
  createTrip,
  type CreateTripPayload,
} from "@/services/trips.service";
import {
  validateOpenCallApplicationFields,
  type ApplicationFormField,
} from "@/services/open-calls.service";
import { resolveApplicationFieldLabel, resolveFieldParticipantLabel } from "@/lib/application-form-labels";
import { formatApplicationFormValidationIssue } from "@/lib/application-form-validation-messages";

const TRIPS_ARCHIVE_PATH = "/admin/trips?tab=archive";

function errMessage(e: unknown, requestFailed: string, generic: string): string {
  if (isAxiosError(e)) {
    const d = e.response?.data;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const o = d as Record<string, unknown>;
      if (typeof o.message === "string") return o.message;
      if (Array.isArray(o.message)) return o.message.map(String).join("; ");
      if (typeof o.error === "string") return o.error;
    }
    return e.message || requestFailed;
  }
  if (e instanceof Error) return e.message;
  return generic;
}

export function TripEditorLayout() {
  const t = useTranslations("Dashboard.trips.editor");
  const tAppForm = useTranslations("Dashboard.applicationForm");
  const router = useRouter();

  // Basic info
  const [title, setTitle] = useState("");
  const [moderatorName, setModeratorName] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);

  // Trip details
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("moderate");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [durationHours, setDurationHours] = useState(8);
  const [maxParticipants, setMaxParticipants] = useState(15);
  const [minParticipants, setMinParticipants] = useState(0);

  // Pricing (`price` in API = minimum contribution; join form scales upward from here in the UI)
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Languages
  const [languages, setLanguages] = useState<string[]>(["EN"]);

  // Tags
  const [tags, setTags] = useState<string[]>([]);

  // Stops (itinerary)
  const [stops, setStops] = useState<EditorStop[]>([emptyEditorStop()]);

  // Join trip form (same builder as open-call application form)
  const [bookingFormFields, setBookingFormFields] = useState<ApplicationFormField[]>(() =>
    DEFAULT_TRIP_BOOKING_FORM_FIELDS.map((f) => JSON.parse(JSON.stringify(f))),
  );

  // Workflow
  const [workflowStatus, setWorkflowStatus] = useState<ArticleWorkflowStatus>("draft");
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildRouteSummary = useCallback((): string => {
    return stops
      .map((s) => (s.title.trim() || s.locationName.trim()))
      .filter(Boolean)
      .map((n) => n.split(",")[0]!.trim())
      .join(" \u2192 ");
  }, [stops]);

  const buildPayload = useCallback(
    (status: "draft" | "published"): CreateTripPayload => {
      const filteredHighlights = highlights.filter((h) => h.trim());
      return {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        route_summary: buildRouteSummary() || undefined,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
        price: price || "0",
        currency,
        max_participants: maxParticipants,
        min_participants: minParticipants || undefined,
        status,
        difficulty,
        duration_hours: durationHours,
        tags: tags.length > 0 ? tags : undefined,
        languages: languages.length > 0 ? languages : undefined,
        highlights: filteredHighlights.length > 0 ? filteredHighlights : undefined,
        moderator_name: moderatorName.trim() || undefined,
        stops: editorStopsToTripStops(stops),
      };
    },
    [
      title, description, category, buildRouteSummary,
      startDate, endDate, price, currency, maxParticipants, minParticipants,
      difficulty, durationHours, tags, languages, highlights, moderatorName, stops,
    ],
  );

  const handleStartDateChange = useCallback((v: string) => {
    setStartDate(v);
    if (!v) return;
    setEndDate((prev) => (prev && isEndDatetimeBeforeStart(prev, v) ? v : prev));
  }, []);

  const validateBeforeSubmit = useCallback(() => {
    if (!title.trim()) return t("validation.titleRequired");
    if (!category.trim()) return t("validation.categoryRequired");
    const issue = validateOpenCallApplicationFields(bookingFormFields);
    if (issue)
      return formatApplicationFormValidationIssue(issue, tAppForm, (n) => {
        const f = bookingFormFields.find((x) => x.name === n);
        return f ? resolveFieldParticipantLabel(f, tAppForm) : resolveApplicationFieldLabel(n, tAppForm);
      });
    return null;
  }, [title, category, bookingFormFields, t, tAppForm]);

  const handleSaveDraft = useCallback(async () => {
    const v = validateBeforeSubmit();
    if (v) { setError(v); return; }
    setError(null);
    setBusy(true);
    try {
      await createTrip(buildPayload("draft"));
      router.push(TRIPS_ARCHIVE_PATH);
    } catch (e) {
      setError(errMessage(e, t("errors.requestFailed"), t("errors.generic")));
    } finally {
      setBusy(false);
    }
  }, [validateBeforeSubmit, buildPayload, router, t]);

  const handlePublish = useCallback(async () => {
    if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
    const v = validateBeforeSubmit();
    if (v) { setError(v); return; }
    setError(null);
    setBusy(true);
    try {
      await createTrip(buildPayload("published"));
      router.push(TRIPS_ARCHIVE_PATH);
    } catch (e) {
      setError(errMessage(e, t("errors.requestFailed"), t("errors.generic")));
    } finally {
      setBusy(false);
    }
  }, [workflowStatus, validateBeforeSubmit, buildPayload, router, t]);

  const handleScheduleConfirm = useCallback(
    async (_iso: string) => {
      if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
      const v = validateBeforeSubmit();
      if (v) { setError(v); setScheduleModalOpen(false); return; }
      setError(null);
      setBusy(true);
      try {
        await createTrip(buildPayload("published"));
        setScheduleModalOpen(false);
        router.push(TRIPS_ARCHIVE_PATH);
      } catch (e) {
        setError(errMessage(e, t("errors.requestFailed"), t("errors.generic")));
        setScheduleModalOpen(false);
      } finally {
        setBusy(false);
      }
    },
    [workflowStatus, validateBeforeSubmit, buildPayload, router, t],
  );

  return (
    <div className="flex min-h-0 flex-col">
      <ScheduleArticleModal
        open={scheduleModalOpen}
        busy={busy}
        onClose={() => !busy && setScheduleModalOpen(false)}
        onConfirm={handleScheduleConfirm}
      />

      <TripPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={{
          title,
          description,
          moderatorName,
          category,
          difficulty,
          startDate,
          endDate,
          durationHours,
          maxParticipants,
          minParticipants,
          price,
          currency,
          languages,
          highlights,
          stops,
          status: workflowStatus === "published" || workflowStatus === "scheduled" ? "published" : "draft",
        }}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-6 overflow-y-auto">
          <TripBasicInfo
            title={title}
            onTitleChange={setTitle}
            moderatorName={moderatorName}
            onModeratorNameChange={setModeratorName}
            description={description}
            onDescriptionChange={setDescription}
            highlights={highlights}
            onHighlightsChange={setHighlights}
          />

          <TripDetailsSection
            category={category}
            onCategoryChange={setCategory}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            startDate={startDate}
            onStartDateChange={handleStartDateChange}
            endDate={endDate}
            onEndDateChange={setEndDate}
            durationHours={durationHours}
            onDurationHoursChange={setDurationHours}
            maxParticipants={maxParticipants}
            onMaxParticipantsChange={setMaxParticipants}
            minParticipants={minParticipants}
            onMinParticipantsChange={setMinParticipants}
          />

          <TripPricing
            minPrice={price}
            onMinPriceChange={setPrice}
            currency={currency}
            onCurrencyChange={setCurrency}
          />

          <TripLanguages
            languages={languages}
            onLanguagesChange={setLanguages}
          />

          <ItineraryBuilder
            stops={stops}
            onChange={setStops}
          />

          <section className="rounded-lg border border-[var(--tott-card-border)] p-4 space-y-4">
            <h3 className="text-sm font-bold text-foreground">{t("joinForm.title")}</h3>
            <p className="text-xs text-gray-500">{t("joinForm.hint")}</p>
            <ApplicationFormBuilder
              fields={bookingFormFields}
              onChange={setBookingFormFields}
              defaultTemplateFields={DEFAULT_TRIP_BOOKING_FORM_FIELDS}
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto">
          <TripSummary
            title={title}
            startDate={startDate}
            durationHours={durationHours}
            price={price}
            currency={currency}
            stops={stops}
          />

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#CBA158]/30 bg-[#CBA158]/10 py-2 text-sm font-medium text-[#CBA158] transition-colors hover:bg-[#CBA158]/20"
            >
              {t("sidebar.previewTrip")}
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2 text-sm text-gray-400 hover:text-foreground"
            >
              {t("sidebar.duplicateTrip")}
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2 text-sm text-gray-400 hover:text-foreground"
            >
              {t("sidebar.archive")}
            </button>
          </div>
        </aside>
      </div>

      <ContentEditorFooter
        primaryButtonLabel={t("footer.publishNow")}
        workflowStatus={workflowStatus}
        busy={busy}
        error={error}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        onOpenSchedule={() => setScheduleModalOpen(true)}
      />
    </div>
  );
}
