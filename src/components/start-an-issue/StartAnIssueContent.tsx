"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useSubmitIssueProposal } from "@/hooks/mutations/magazine-intake";
import { formatApiError } from "@/lib/api/error-message";
import { ContributionPageLayout } from "@/components/contribute/ContributionPageLayout";
import {
  Field,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  UserIcon,
  MailIcon,
  PhoneIcon,
  SchoolIcon,
  ACCENT,
  ACCENT_TEXT,
  FIELD_BORDER,
  FIELD_RADIUS,
  HELPER_COLOR,
  LABEL_COLOR,
} from "@/components/contribute/ContributionFormFields";

const EXPERIENCE_KEYS = [
  "Journalism",
  "Research",
  "Photography",
  "Filmmaking",
  "Writing",
  "Art",
  "Education",
  "Technology",
  "Other",
] as const;

export function StartAnIssueContent() {
  const t = useTranslations("StartAnIssue");
  const tf = useTranslations("StartAnIssue.form");
  const ts = useTranslations("StartAnIssue.support");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [issueTitle, setIssueTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submit = useSubmitIssueProposal();
  const submitting = submit.isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed || submitting || submitted) return;
    if (!issueTitle.trim() || !email.trim() || !description.trim()) {
      toast.error(tf("validationError"));
      return;
    }
    submit.mutate(
      {
        title: issueTitle.trim(),
        theme: theme.trim() || undefined,
        experience: experience.trim() || undefined,
        description: description.trim(),
        contributorName: `${firstName} ${lastName}`.trim(),
        contributorEmail: email.trim(),
        contributorPhone: phone.trim() || undefined,
        consent: agreed,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success(tf("submittedToast"));
        },
        onError: (err) =>
          toast.error(tf("submitError"), {
            description: formatApiError(err, tf("submitErrorBody")),
          }),
      },
    );
  };

  // Title block — Figma "Title" frame. Page-specific, so it's passed to the
  // shared layout rather than owned by it.
  const titleBlock = (
    <div
      className="flex flex-col items-start"
      style={{ gap: "12px", padding: 0, width: "100%" }}
    >
      <span
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: LABEL_COLOR,
          margin: 0,
        }}
      >
        {t("eyebrow")}
      </span>
      <h1
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "24px",
          lineHeight: "32px",
          color: LABEL_COLOR,
          margin: 0,
        }}
      >
        {t("title")}
      </h1>
      <p
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: LABEL_COLOR,
          margin: 0,
        }}
      >
        {t("subtitle")}
      </p>
    </div>
  );

  return (
    <ContributionPageLayout
      titleBlock={titleBlock}
      support={{
        title: ts("title"),
        description: ts("description"),
        ctaLabel: ts("cta"),
        ctaHref: "/contribute",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-stretch"
        style={{ gap: "24px" }}
      >
        {/* Row — First name + Last name */}
        <div className="flex flex-col sm:flex-row sm:items-start" style={{ gap: "24px" }}>
          <Field label={tf("firstName")}>
            <FieldInput
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={tf("firstNamePlaceholder")}
              maxLength={120}
              icon={<UserIcon />}
            />
          </Field>
          <Field label={tf("lastName")}>
            <FieldInput
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={tf("lastNamePlaceholder")}
              maxLength={120}
              icon={<UserIcon />}
            />
          </Field>
        </div>

        <Field label={tf("email")}>
          <FieldInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tf("emailPlaceholder")}
            maxLength={200}
            icon={<MailIcon />}
          />
        </Field>

        <Field label={tf("phone")} helper={tf("phoneHint")}>
          <FieldInput
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={tf("phonePlaceholder")}
            maxLength={32}
            icon={<PhoneIcon />}
          />
        </Field>

        <Field label={tf("experienceField")}>
          <FieldSelect
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            icon={<SchoolIcon />}
            placeholder={tf("experiencePlaceholder")}
          >
            {EXPERIENCE_KEYS.map((key) => (
              <option key={key} value={key.toLowerCase()}>
                {tf(`experience${key}`)}
              </option>
            ))}
          </FieldSelect>
        </Field>

        <Field label={tf("issueTitle")}>
          <FieldInput
            type="text"
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
            placeholder={tf("issueTitlePlaceholder")}
            maxLength={160}
          />
        </Field>

        <Field label={tf("theme")}>
          <FieldInput
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder={tf("themePlaceholder")}
            maxLength={120}
          />
        </Field>

        <Field label={tf("description")}>
          <FieldTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={tf("descriptionPlaceholder")}
            maxLength={2000}
            rows={5}
          />
        </Field>

        {/* Checkbox label */}
        <label className="flex cursor-pointer flex-row items-center" style={{ gap: "8px" }}>
          <span className="relative inline-block" style={{ width: "20px", height: "20px" }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer absolute inset-0 cursor-pointer opacity-0"
              style={{ width: "20px", height: "20px" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{ left: "2px", top: "2px", width: "16px", height: "16px", backgroundColor: FIELD_BORDER, borderRadius: "4px" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{ left: "3.5px", top: "3.5px", width: "13px", height: "13px", backgroundColor: "var(--tott-home-surface)", borderRadius: "2.5px" }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute opacity-0 peer-checked:opacity-100"
              style={{ left: "4px", top: "4px", width: "12px", height: "12px", color: ACCENT }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </span>
          <span
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: LABEL_COLOR,
            }}
          >
            {tf("terms")}{" "}
            <Link href="/terms" className="hover:underline" style={{ color: ACCENT }}>
              {tf("termsLink")}
            </Link>{" "}
            {tf("and")}{" "}
            <Link href="/privacy" className="hover:underline" style={{ color: ACCENT }}>
              {tf("privacyLink")}
            </Link>
          </span>
        </label>

        {/* Submit — gold pill, 40px tall */}
        <button
          type="submit"
          disabled={!agreed || submitting || submitted}
          className="w-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            height: "40px",
            padding: "8px 16px",
            borderRadius: `${FIELD_RADIUS}px`,
            backgroundColor: ACCENT,
            boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
            color: ACCENT_TEXT,
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            textAlign: "center",
            border: "none",
            cursor: !agreed || submitting || submitted ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? tf("submitting") : submitted ? tf("submitted") : tf("submit")}
        </button>

        {/* Go back */}
        <div className="flex flex-row items-end justify-center" style={{ gap: "4px" }}>
          <span
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: HELPER_COLOR,
            }}
          >
            {tf("backToHomeLead")}
          </span>
          <Link
            href="/"
            className="hover:underline"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: ACCENT,
            }}
          >
            {tf("backToHomeLink")}
          </Link>
        </div>
      </form>
    </ContributionPageLayout>
  );
}
