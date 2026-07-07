"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { ApplicationFormField } from "@/services/open-calls.service";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";

const FIELD_BG = "bg-[var(--tott-dash-input-bg)]";
const FIELD_BORDER = "border-[var(--tott-card-border)]";
const FIELD_RADIUS = "rounded-[7.5px]";

const FIELD_BASE = `w-full ${FIELD_RADIUS} border ${FIELD_BORDER} ${FIELD_BG} px-3 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-card-border)]`;

function iconForFieldName(name: string): ReactNode {
  const n = name.toLowerCase();
  const stroke = "var(--tott-muted)";
  if (n.includes("first") || n.includes("last") || n === "full_name") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke}
           strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
  if (n.includes("email")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke}
           strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <polyline points="3 7 12 13 21 7" />
      </svg>
    );
  }
  if (n.includes("phone")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke}
           strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  if (n.includes("experience") || n.includes("field")) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={stroke}
           strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    );
  }
  // Country / city: the four-diamond glyph lives on the RIGHT as the trailing
  // dropdown affordance (replaces the chevron). No leading icon.
  if (n.includes("country") || n.includes("city") || n.includes("location")) {
    return null;
  }
  return null;
}

function CountryCityTrailingIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 28 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 12L9 14.5L11.5 12L9 9.5L6.5 12Z" />
      <path d="M16.5 12L19 14.5L21.5 12L19 9.5L16.5 12Z" />
      <path d="M11.5 7L14 9.5L16.5 7L14 4.5L11.5 7Z" />
      <path d="M11.5 17L14 19.5L16.5 17L14 14.5L11.5 17Z" />
    </svg>
  );
}

function FieldShell({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--tott-muted)]">
          {icon}
        </span>
      ) : null}
      {children}
    </div>
  );
}

function placeholderForField(f: ApplicationFormField): string {
  const n = f.name.toLowerCase();
  if (n === "first_name") return "Enter your first name";
  if (n === "last_name") return "Enter your last name";
  if (n === "email") return "Placeholder…";
  if (n === "phone") return "Enter your phone number";
  if (n === "experience_field") return "Select or write your experience field";
  if (n === "about")
    return "Describe yourself, experience, or your projects. and why we should accept you in the collective teams.";
  if (n === "country" || n === "city") return "Select";
  return "";
}

function labelForField(f: ApplicationFormField): string {
  if (f.label && f.label.trim()) return f.label.trim();
  const n = f.name.toLowerCase();
  if (n === "first_name") return "First name";
  if (n === "last_name") return "Last name";
  if (n === "email") return "Email address";
  if (n === "phone") return "Phone number";
  if (n === "experience_field") return "Experience field";
  if (n === "about") return "Tell us about yourself";
  if (n === "country") return "Country";
  if (n === "city") return "City";
  if (n === "files") return "Upload files";
  // Fallback: humanise the snake_case name.
  return n
    .split("_")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function FieldWithLabel({ field, children }: { field: ApplicationFormField; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-foreground">{labelForField(field)}</p>
      {children}
    </div>
  );
}

function renderField(f: ApplicationFormField) {
  const icon = iconForFieldName(f.name);
  const placeholder = placeholderForField(f);
  const padLeft = icon ? "pl-9" : "";

  if (f.type === "textarea") {
    return (
      <textarea
        rows={5}
        placeholder={placeholder}
        className={`${FIELD_BASE} resize-none`}
      />
    );
  }
  if (f.type === "select") {
    const isCountryCity = (() => {
      const n = f.name.toLowerCase();
      return n.includes("country") || n.includes("city") || n.includes("location");
    })();
    const trailing = isCountryCity ? <CountryCityTrailingIcon /> : null;
    return (
      <FieldShell icon={icon}>
        <select
          className={`${FIELD_BASE} appearance-none ${padLeft} ${trailing ? "pr-9" : ""} text-[var(--tott-muted)]`}
          defaultValue=""
          // Suppress every browser's native dropdown indicator so only our
          // custom trailing icon (or nothing) renders on the right.
          style={{
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            backgroundImage: "none",
          }}
        >
          <option value="" disabled>{placeholder}</option>
          {f.options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
        {trailing ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--tott-muted)]">
            {trailing}
          </span>
        ) : null}
      </FieldShell>
    );
  }
  return (
    <FieldShell icon={icon}>
      <input
        type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
        placeholder={placeholder}
        className={`${FIELD_BASE} ${padLeft}`}
      />
    </FieldShell>
  );
}

function fieldByName(fields: ApplicationFormField[], name: string): ApplicationFormField | null {
  return fields.find((f) => f.name === name) ?? null;
}

function findFile(fields: ApplicationFormField[]): ApplicationFormField | null {
  return fields.find((f) => f.type === "file_multiple") ?? null;
}

function findCheckbox(fields: ApplicationFormField[]): ApplicationFormField | null {
  return fields.find((f) => f.type === "checkbox") ?? null;
}

export function ApplicationFormPreview({ fields }: { fields: ApplicationFormField[] }) {
  // Suppress next-intl unused-namespace warning while we keep the prior import
  // hook open for future per-locale previews.
  useTranslations("Dashboard.applicationForm");

  const firstName = fieldByName(fields, "first_name");
  const lastName = fieldByName(fields, "last_name");
  const email = fieldByName(fields, "email");
  const phone = fieldByName(fields, "phone");
  const experience = fieldByName(fields, "experience_field");
  const about = fieldByName(fields, "about");
  const country = fieldByName(fields, "country");
  const city = fieldByName(fields, "city");
  const filesField = findFile(fields);
  const termsField = findCheckbox(fields);

  // Anything in `fields` that isn't a known slot — render at the bottom so
  // admin-added custom fields don't disappear from the preview.
  const knownNames = new Set([
    "first_name",
    "last_name",
    "email",
    "phone",
    "experience_field",
    "about",
    "country",
    "city",
    filesField?.name,
    termsField?.name,
  ]);
  const extras = fields.filter((f) => !knownNames.has(f.name));

  return (
    <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-5">
      <div className="flex flex-col gap-3">
        {(firstName || lastName) ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {firstName ? (
              <FieldWithLabel field={firstName}>{renderField(firstName)}</FieldWithLabel>
            ) : <div />}
            {lastName ? (
              <FieldWithLabel field={lastName}>{renderField(lastName)}</FieldWithLabel>
            ) : <div />}
          </div>
        ) : null}

        {email ? (
          <FieldWithLabel field={email}>{renderField(email)}</FieldWithLabel>
        ) : null}

        {phone ? (
          <FieldWithLabel field={phone}>
            {renderField(phone)}
            <p className="mt-1.5 text-xs text-[var(--tott-muted)]">
              Don&apos;t forget to to write the phone number with your country code
            </p>
          </FieldWithLabel>
        ) : null}

        {experience ? (
          <FieldWithLabel field={experience}>{renderField(experience)}</FieldWithLabel>
        ) : null}

        {about ? (
          <FieldWithLabel field={about}>{renderField(about)}</FieldWithLabel>
        ) : null}

        {(country || city) ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {country ? (
              <FieldWithLabel field={country}>{renderField(country)}</FieldWithLabel>
            ) : <div />}
            {city ? (
              <FieldWithLabel field={city}>{renderField(city)}</FieldWithLabel>
            ) : <div />}
          </div>
        ) : null}

        {extras.map((f, i) => (
          <FieldWithLabel key={`extra-${i}`} field={f}>{renderField(f)}</FieldWithLabel>
        ))}

        {filesField && filesField.type === "file_multiple" ? (
          <div className="space-y-2.5">
            <p className="text-sm text-foreground">
              {labelForField(filesField)}{" "}
              <span className="text-xs text-[var(--tott-muted)]">Upload as many as you want</span>
            </p>
            <div className={`${FIELD_RADIUS} border ${FIELD_BORDER} ${FIELD_BG} px-4 py-8 text-center`}>
              <span className="mx-auto mb-2 inline-flex h-6 w-6 items-center justify-center text-[var(--tott-muted)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </span>
              <p className="text-sm font-medium text-foreground">
                Drag and drop files here, or click to browse
              </p>
              <p className="mt-1 text-xs text-[var(--tott-muted)]">
                Supported formats: {filesField.allowed_types.join(", ")} (Max {filesField.max_size_mb}MB)
              </p>
            </div>
            {/* Sample file row — purely illustrative for the preview. */}
            <div className={`flex items-center justify-between gap-3 ${FIELD_RADIUS} border ${FIELD_BORDER} ${FIELD_BG} px-3 py-2.5`}>
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-2)] text-[var(--tott-muted)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">the-history-of-palestine.pdf</p>
                  <p className="text-xs text-[var(--tott-muted)]">16.28 MB</p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Remove file"
                className="grid h-8 w-8 place-items-center rounded-md text-[var(--tott-muted)] transition-colors hover:text-foreground"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}

        {termsField ? (
          <label className="mt-1 flex items-center gap-3 text-sm text-[var(--tott-muted)]">
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] accent-[var(--tott-accent-gold)]"
            />
            <span className="flex-1 text-center">
              I agree to the{" "}
              <a className="text-[var(--tott-dash-gold-text)] hover:underline" href="#">terms</a>
              {" "}and{" "}
              <a className="text-[var(--tott-dash-gold-text)] hover:underline" href="#">privacy policy.</a>
            </span>
          </label>
        ) : null}

        <button
          type="button"
          className="mt-1 w-full rounded-md bg-[var(--tott-accent-gold)] py-3 text-sm font-medium text-[var(--tott-on-accent)]"
        >
          Submit
        </button>

        <p className="mt-1 text-center text-sm text-[var(--tott-muted)]">
          Go back to{" "}
          <a className="text-[var(--tott-dash-gold-text)] hover:underline" href="#">Home page</a>
        </p>
      </div>
    </ChamferedPanel>
  );
}
