"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { HexImageGrid } from "@/components/ui/HexImageGrid";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

const TIP_JAR_ICON = "/images/start-an-issue/tip-jar-icon.svg";

const ICON_STROKE = "#7B7B7B";
const FIELD_BG = "#262626";
const FIELD_BORDER = "#333333";
const FIELD_RADIUS = 8;
const LABEL_COLOR = "#FFFFFF";
const HELPER_COLOR = "#A3A3A3";
const PLACEHOLDER_COLOR = "#7B7B7B";
const ACCENT = "#C9A96E";
const ACCENT_TEXT = "#332217";

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed || submitting) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div
        className="relative mx-auto flex w-full flex-col items-stretch px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{ maxWidth: "min(92vw, 1600px)" }}
      >
        <section className="relative flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
          <HexImageGrid className="pt-2" />

          {/* Sidebar — fixed 552px on desktop, scales below */}
          <div
            className="relative flex w-full min-w-0 flex-col items-start"
            style={{ maxWidth: "552px" }}
          >
            {/* Title block — Figma "Title" frame */}
            <div
              className="flex flex-col items-start"
              style={{
                gap: "12px",
                padding: 0,
                width: "100%",
                marginBottom: "24px",
              }}
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

            {/* Sidebar Container — Figma "Sidebar Container".
                ChamferedFrame paints the top + bottom edges (with
                24px corner cuts) and the left + right borders. The
                Body sits between those edges. */}
            <form
              onSubmit={handleSubmit}
              className="relative w-full"
              style={{ padding: "24px 0" }}
            >
              <ChamferedFrame size={24} borderColor={FIELD_BORDER} />

              {/* Body — 16px top/bottom, 40px left/right, 24px gap */}
              <div
                className="flex w-full flex-col items-stretch"
                style={{
                  padding: "16px 40px",
                  gap: "24px",
                }}
              >
                {/* Row — First name + Last name, 24px gap */}
                <div
                  className="flex flex-col sm:flex-row sm:items-start"
                  style={{ gap: "24px" }}
                >
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

                {/* Description textarea — 112px tall, 6×6 resizer
                    handle in the bottom-right corner per Figma. */}
                <Field label={tf("description")}>
                  <div
                    className="relative w-full"
                    style={{
                      backgroundColor: FIELD_BG,
                      border: `1px solid ${FIELD_BORDER}`,
                      borderRadius: `${FIELD_RADIUS}px`,
                    }}
                  >
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={tf("descriptionPlaceholder")}
                      maxLength={2000}
                      rows={5}
                      className="block w-full resize-y bg-transparent focus:outline-none"
                      style={{
                        height: "112px",
                        padding: "8px 12px",
                        color: LABEL_COLOR,
                        fontFamily: "'Inter', var(--font-sans, sans-serif)",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "20px",
                        letterSpacing: "0.005em",
                        border: "none",
                        borderRadius: `${FIELD_RADIUS}px`,
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute"
                      style={{
                        width: "6px",
                        height: "6px",
                        right: "8px",
                        bottom: "8px",
                        backgroundColor: "#5C5C5C",
                      }}
                    />
                  </div>
                </Field>

                {/* Checkbox label — Figma "Checkbox Label" */}
                <label
                  className="flex cursor-pointer flex-row items-center"
                  style={{ gap: "8px" }}
                >
                  <span
                    className="relative inline-block"
                    style={{ width: "20px", height: "20px" }}
                  >
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
                      style={{
                        left: "2px",
                        top: "2px",
                        width: "16px",
                        height: "16px",
                        backgroundColor: FIELD_BORDER,
                        borderRadius: "4px",
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute"
                      style={{
                        left: "3.5px",
                        top: "3.5px",
                        width: "13px",
                        height: "13px",
                        backgroundColor: "#171717",
                        borderRadius: "2.5px",
                      }}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute opacity-0 peer-checked:opacity-100"
                      style={{
                        left: "4px",
                        top: "4px",
                        width: "12px",
                        height: "12px",
                        color: ACCENT,
                      }}
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
                    <Link
                      href="/terms"
                      className="hover:underline"
                      style={{ color: ACCENT }}
                    >
                      {tf("termsLink")}
                    </Link>{" "}
                    {tf("and")}{" "}
                    <Link
                      href="/privacy"
                      className="hover:underline"
                      style={{ color: ACCENT }}
                    >
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
                    cursor:
                      !agreed || submitting || submitted
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {submitting
                    ? tf("submitting")
                    : submitted
                      ? tf("submitted")
                      : tf("submit")}
                </button>

                {/* Go back — "Go back to" muted + "Home page" link */}
                <div
                  className="flex flex-row items-end justify-center"
                  style={{ gap: "4px" }}
                >
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
              </div>
            </form>

            {/* Support card — Figma "Sidebar Container" (152px tall
                variant). Same ChamferedFrame treatment as the form
                sidebar, then a single body row of icon + text + button. */}
            <div
              className="relative mt-8 w-full"
              style={{ padding: "24px 0" }}
            >
              <ChamferedFrame size={24} borderColor={FIELD_BORDER} />
              <div
                className="flex w-full flex-col items-stretch sm:flex-row sm:items-center"
                style={{
                  padding: "16px 40px",
                  gap: "24px",
                }}
              >
                {/* Icon wrapper — brand-exported 56×64 hex SVG with
                    the dark fill, inner shadow, and gold tip-jar
                    glyph all baked in (Figma "Icon Wrapper-13"). */}
                <span
                  aria-hidden
                  className="relative inline-block shrink-0 self-center sm:self-auto"
                  style={{ width: "56px", height: "64px" }}
                >
                  <Image
                    src={TIP_JAR_ICON}
                    alt=""
                    fill
                    sizes="56px"
                    className="select-none"
                    draggable={false}
                  />
                </span>

                {/* Text block */}
                <div
                  className="flex min-w-0 flex-1 flex-col"
                  style={{ gap: "8px" }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: LABEL_COLOR,
                    }}
                  >
                    {ts("title")}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "20px",
                      letterSpacing: "-0.005em",
                      color: HELPER_COLOR,
                      textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)",
                    }}
                  >
                    {ts("description")}
                  </p>
                </div>

                {/* Button — gold pill, 117×40 per Figma (auto-sizes
                    to text on smaller viewports). */}
                <Link
                  href="/contribute"
                  className="inline-flex shrink-0 items-center justify-center self-stretch transition-opacity hover:opacity-90 sm:self-center"
                  style={{
                    height: "40px",
                    padding: "8px",
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
                  }}
                >
                  <span style={{ padding: "2px 4px" }}>{ts("cta")}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

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

// ─── Field / Input building blocks ───────────────────────────────

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className="flex w-full flex-1 flex-col items-stretch"
      style={{ gap: "8px" }}
    >
      <span
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: LABEL_COLOR,
        }}
      >
        {label}
      </span>
      {children}
      {helper ? (
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "16px",
            color: HELPER_COLOR,
          }}
        >
          {helper}
        </span>
      ) : null}
    </label>
  );
}

type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
};

function FieldInput({ icon, style, ...rest }: FieldInputProps) {
  return (
    <span
      className="flex w-full flex-row items-center"
      style={{
        height: "40px",
        padding: "8px",
        backgroundColor: FIELD_BG,
        border: `1px solid ${FIELD_BORDER}`,
        borderRadius: `${FIELD_RADIUS}px`,
        boxSizing: "border-box",
      }}
    >
      {icon ? <LeadingIcon>{icon}</LeadingIcon> : null}
      <input
        {...rest}
        className="min-w-0 flex-1 bg-transparent focus:outline-none"
        style={{
          padding: "2px 8px",
          color: LABEL_COLOR,
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          border: "none",
          ...(style || {}),
        }}
      />
    </span>
  );
}

type FieldSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  icon?: React.ReactNode;
  placeholder?: string;
};

function FieldSelect({
  icon,
  placeholder,
  children,
  value,
  style,
  ...rest
}: FieldSelectProps) {
  const isEmpty = value === "" || value == null;
  return (
    <span
      className="relative flex w-full flex-row items-center"
      style={{
        height: "40px",
        padding: "8px",
        backgroundColor: FIELD_BG,
        border: `1px solid ${FIELD_BORDER}`,
        borderRadius: `${FIELD_RADIUS}px`,
        boxSizing: "border-box",
      }}
    >
      {icon ? <LeadingIcon>{icon}</LeadingIcon> : null}
      <select
        {...rest}
        value={value}
        className="min-w-0 flex-1 bg-transparent focus:outline-none"
        style={{
          padding: "2px 8px",
          color: isEmpty ? PLACEHOLDER_COLOR : LABEL_COLOR,
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          border: "none",
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage: "none",
          ...(style || {}),
        }}
      >
        {placeholder ? (
          <option
            value=""
            style={{ backgroundColor: FIELD_BG, color: PLACEHOLDER_COLOR }}
          >
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <TrailingIcon>
        <ChevronDownGlyph />
      </TrailingIcon>
    </span>
  );
}

function LeadingIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center"
      style={{
        width: "28px",
        height: "24px",
        padding: "2px 4px",
        color: ICON_STROKE,
      }}
    >
      {children}
    </span>
  );
}

function TrailingIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none inline-flex items-center justify-center"
      style={{
        width: "28px",
        height: "24px",
        padding: "2px 4px",
        color: ICON_STROKE,
      }}
    >
      {children}
    </span>
  );
}

// ─── Outlined icons (1.5px stroke, 20×20) ────────────────────────

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 10l10-5 10 5-10 5L2 10z" />
      <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
      <line x1="22" y1="10" x2="22" y2="16" />
    </svg>
  );
}

function ChevronDownGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
