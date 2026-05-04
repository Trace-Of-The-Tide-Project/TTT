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
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState(1);
  const [groupSize, setGroupSize] = useState(15);
  const [openGroup, setOpenGroup] = useState(true);
  // Hours version for the API; the UI works in days for the new design.
  const durationHours = durationDays * 24;
  // End date derived from start date + duration so the API still gets it.
  const endDate = (() => {
    if (!startDate) return "";
    const d = new Date(startDate);
    if (Number.isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + Math.max(0, durationDays - 1));
    return d.toISOString().slice(0, 10);
  })();
  const minParticipants = openGroup ? 0 : groupSize;

  // Pricing (`price` in API = minimum contribution; join form scales upward from here in the UI)
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [maxPrice, setMaxPrice] = useState("");
  const [discount, setDiscount] = useState("");

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

  const handleResetForm = useCallback(() => {
    setTitle("");
    setModeratorName("");
    setDescription("");
    setHighlights([""]);
    setCategory("");
    setDifficulty("moderate");
    setStartLocation("");
    setEndLocation("");
    setStartDate("");
    setDurationDays(1);
    setGroupSize(15);
    setOpenGroup(true);
    setPrice("");
    setCurrency("USD");
    setMaxPrice("");
    setDiscount("");
    setLanguages(["EN"]);
    setTags([]);
    setStops([emptyEditorStop()]);
    setBookingFormFields(
      DEFAULT_TRIP_BOOKING_FORM_FIELDS.map((f) => JSON.parse(JSON.stringify(f))),
    );
    setError(null);
  }, []);

  const buildRouteSummary = useCallback((): string => {
    const parts: string[] = [];
    if (startLocation.trim()) parts.push(startLocation.trim());
    if (endLocation.trim()) parts.push(endLocation.trim());
    if (parts.length) return parts.join(" \u2192 ");
    return stops
      .map((s) => (s.title.trim() || s.locationName.trim()))
      .filter(Boolean)
      .map((n) => n.split(",")[0]!.trim())
      .join(" \u2192 ");
  }, [stops, startLocation, endLocation]);

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
        max_participants: groupSize,
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
      startDate, endDate, price, currency, groupSize, minParticipants,
      difficulty, durationHours, tags, languages, highlights, moderatorName, stops,
    ],
  );

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
          maxParticipants: groupSize,
          minParticipants,
          price,
          currency,
          languages,
          highlights,
          stops,
          status: workflowStatus === "published" || workflowStatus === "scheduled" ? "published" : "draft",
        }}
      />

      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:overflow-hidden">
        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-6 lg:overflow-y-auto">
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
            startLocation={startLocation}
            onStartLocationChange={setStartLocation}
            endLocation={endLocation}
            onEndLocationChange={setEndLocation}
            startDate={startDate}
            onStartDateChange={setStartDate}
            durationDays={durationDays}
            onDurationDaysChange={setDurationDays}
            groupSize={groupSize}
            onGroupSizeChange={setGroupSize}
            openGroup={openGroup}
            onOpenGroupChange={setOpenGroup}
          />

          <TripPricing
            minPrice={price}
            onMinPriceChange={setPrice}
            currency={currency}
            onCurrencyChange={setCurrency}
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            discount={discount}
            onDiscountChange={setDiscount}
          />

          <TripLanguages
            languages={languages}
            onLanguagesChange={setLanguages}
          />

          <ItineraryBuilder
            stops={stops}
            onChange={setStops}
          />

        </div>

        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-64 lg:overflow-y-auto">
          <TripSummary
            title={title}
            startDate={startDate}
            durationDays={durationDays}
            durationHours={durationHours}
            price={price}
            currency={currency}
            stops={stops}
            startLocation={startLocation}
            endLocation={endLocation}
            actions={
              <>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--tott-dash-control-bg)] py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {t("sidebar.duplicateTrip")}
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--tott-dash-control-bg)] py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                >
                  <svg width="16" height="14" viewBox="0 0 28 24" fill="none" stroke="currentColor"
                       strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20.6107 12.8684C20.4534 14.0683 19.9723 15.2028 19.2192 16.1502C18.4661 17.0975 17.4693 17.822 16.3357 18.2459C15.2021 18.6698 13.9745 18.7771 12.7846 18.5564C11.5947 18.3356 10.4873 17.7951 9.58118 16.9928C8.67509 16.1905 8.00448 15.1567 7.64128 14.0022C7.27808 12.8478 7.23599 11.6162 7.51952 10.4397C7.80305 9.26314 8.4015 8.18595 9.2507 7.32367C10.0999 6.46138 11.1678 5.84653 12.3399 5.54504C15.5891 4.7117 18.9524 6.3842 20.1941 9.50087M20.6666 5.33421V9.50087H16.4999" />
                  </svg>
                  {t("sidebar.resetForm")}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[var(--tott-dash-control-bg)] py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="2" y="3" width="20" height="5" rx="1" />
                    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                  {t("sidebar.archiveTrip")}
                </button>
              </>
            }
          />
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
