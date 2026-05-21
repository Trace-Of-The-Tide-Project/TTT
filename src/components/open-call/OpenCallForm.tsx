"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CloudUploadIcon, FileTextIcon, TrashIcon } from "@/components/ui/icons";
import { COUNTRY_CODES } from "@/lib/constants";
import {
  Field,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  LeadingIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  SchoolIcon,
  FIELD_BG,
  FIELD_BORDER,
  FIELD_RADIUS,
  LABEL_COLOR,
  HELPER_COLOR,
  ACCENT,
  ACCENT_TEXT,
} from "@/components/contribute/ContributionFormFields";

const SANS = "'Inter', var(--font-sans, sans-serif)";

type UploadedFile = { id: string; file: File; sizeLabel: string };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function OpenCallForm() {
  const td = useTranslations("Dashboard.applicationForm.demoOpenCall");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [experience, setExperience] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      sizeLabel: formatFileSize(file.size),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full select-none flex-col items-stretch"
      style={{ gap: "24px" }}
    >
      {/* Row — First name + Last name */}
      <div className="flex flex-col sm:flex-row sm:items-start" style={{ gap: "24px" }}>
        <Field label={td("firstName")}>
          <FieldInput name="firstName" type="text" placeholder={td("firstNamePlaceholder")} icon={<UserIcon />} />
        </Field>
        <Field label={td("lastName")}>
          <FieldInput name="lastName" type="text" placeholder={td("lastNamePlaceholder")} icon={<UserIcon />} />
        </Field>
      </div>

      <Field label={td("email")}>
        <FieldInput name="email" type="email" placeholder={td("emailPlaceholder")} icon={<MailIcon />} />
      </Field>

      {/* Phone — country-code picker + number, in the shared field aesthetic */}
      <Field label={td("phone")} helper={td("phoneHint")}>
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
          <LeadingIcon>
            <PhoneIcon />
          </LeadingIcon>
          <select
            name="countryCode"
            defaultValue="+20"
            aria-label="Country code"
            className="shrink-0 cursor-pointer bg-transparent focus:outline-none"
            style={{
              color: LABEL_COLOR,
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              border: "none",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              paddingRight: "4px",
            }}
          >
            {COUNTRY_CODES.map(({ code, country: c }) => (
              <option key={code} value={code} style={{ backgroundColor: FIELD_BG, color: LABEL_COLOR }}>
                {code} {c}
              </option>
            ))}
          </select>
          <span aria-hidden style={{ width: "1px", height: "20px", backgroundColor: FIELD_BORDER, margin: "0 4px" }} />
          <input
            name="phone"
            type="tel"
            placeholder={td("phonePlaceholder")}
            className="min-w-0 flex-1 bg-transparent focus:outline-none"
            style={{
              padding: "2px 8px",
              color: LABEL_COLOR,
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              border: "none",
            }}
          />
        </span>
      </Field>

      {/* Experience */}
      <Field label={td("experienceField")}>
        <FieldSelect
          name="experience"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          icon={<SchoolIcon />}
          placeholder={td("experiencePlaceholder")}
        >
          <option value="journalism">{td("experienceJournalism")}</option>
          <option value="research">{td("experienceResearch")}</option>
          <option value="photography">{td("experiencePhotography")}</option>
          <option value="filmmaking">{td("experienceFilmmaking")}</option>
          <option value="writing">{td("experienceWriting")}</option>
          <option value="art">{td("experienceArt")}</option>
          <option value="education">{td("experienceEducation")}</option>
          <option value="technology">{td("experienceTechnology")}</option>
          <option value="other">{td("experienceOther")}</option>
        </FieldSelect>
      </Field>

      {/* Tell us about yourself */}
      <Field label={td("about")}>
        <FieldTextarea name="about" placeholder={td("aboutPlaceholder")} rows={4} />
      </Field>

      {/* Row — Country + City */}
      <div className="flex flex-col sm:flex-row sm:items-start" style={{ gap: "24px" }}>
        <Field label={td("country")}>
          <FieldSelect
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder={td("select")}
          >
            <option value="palestine">{td("countryPalestine")}</option>
            <option value="egypt">{td("countryEgypt")}</option>
            <option value="jordan">{td("countryJordan")}</option>
            <option value="lebanon">{td("countryLebanon")}</option>
            <option value="other">{td("countryOther")}</option>
          </FieldSelect>
        </Field>
        <Field label={td("city")}>
          <FieldSelect
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={td("select")}
          />
        </Field>
      </div>

      {/* Upload files */}
      <div className="flex w-full flex-col" style={{ gap: "8px" }}>
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: LABEL_COLOR,
          }}
        >
          {td("uploadLabel")}{" "}
          <span style={{ fontWeight: 400, color: HELPER_COLOR }}>{td("uploadHint")}</span>
        </span>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className="flex flex-col items-center justify-center transition-colors"
          style={{
            padding: "24px",
            gap: "8px",
            backgroundColor: FIELD_BG,
            border: `1px dashed ${isDragging ? ACCENT : FIELD_BORDER}`,
            borderRadius: `${FIELD_RADIUS}px`,
          }}
        >
          <input type="file" multiple className="hidden" id="opencall-upload" onChange={(e) => addFiles(e.target.files)} />
          <label htmlFor="opencall-upload" className="flex cursor-pointer flex-col items-center" style={{ gap: "4px" }}>
            <span style={{ color: HELPER_COLOR }}>
              <CloudUploadIcon />
            </span>
            <span
              style={{ fontFamily: SANS, fontWeight: 500, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: LABEL_COLOR, textAlign: "center" }}
            >
              {td("uploadDrop")}
            </span>
            <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: HELPER_COLOR, textAlign: "center" }}>
              {td("uploadFormats")}
            </span>
          </label>
        </div>

        {files.length > 0 && (
          <ul className="flex flex-col" style={{ gap: "8px", marginTop: "8px" }}>
            {files.map(({ id, file, sizeLabel }) => (
              <li
                key={id}
                className="flex flex-row items-center"
                style={{
                  padding: "12px",
                  gap: "12px",
                  backgroundColor: FIELD_BG,
                  border: `1px solid ${FIELD_BORDER}`,
                  borderRadius: `${FIELD_RADIUS}px`,
                }}
              >
                <span
                  className="flex shrink-0 items-center justify-center"
                  style={{ width: "40px", height: "40px", border: `1px solid ${FIELD_BORDER}`, borderRadius: "4px", color: HELPER_COLOR }}
                >
                  <FileTextIcon />
                </span>
                <span className="flex min-w-0 flex-1 flex-col" style={{ gap: "4px" }}>
                  <span
                    className="truncate"
                    style={{ fontFamily: SANS, fontWeight: 500, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "rgba(255,255,255,0.72)" }}
                  >
                    {file.name}
                  </span>
                  <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: "rgba(255,255,255,0.48)" }}>
                    {sizeLabel}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  className="shrink-0 transition-opacity hover:opacity-70 focus:outline-none"
                  style={{ padding: "4px", borderRadius: "6px", color: HELPER_COLOR }}
                  aria-label={td("removeFileAria")}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Terms agreement */}
      <label className="flex cursor-pointer flex-row items-center" style={{ gap: "8px" }}>
        <span className="relative inline-block" style={{ width: "20px", height: "20px" }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="peer absolute inset-0 cursor-pointer opacity-0"
            style={{ width: "20px", height: "20px" }}
          />
          <span aria-hidden className="pointer-events-none absolute" style={{ left: "2px", top: "2px", width: "16px", height: "16px", backgroundColor: FIELD_BORDER, borderRadius: "4px" }} />
          <span aria-hidden className="pointer-events-none absolute" style={{ left: "3.5px", top: "3.5px", width: "13px", height: "13px", backgroundColor: "var(--tott-home-surface)", borderRadius: "2.5px" }} />
          <span aria-hidden className="pointer-events-none absolute opacity-0 peer-checked:opacity-100" style={{ left: "4px", top: "4px", width: "12px", height: "12px", color: ACCENT }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </span>
        <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: LABEL_COLOR }}>
          {td("terms")}{" "}
          <Link href="/terms" className="hover:underline" style={{ color: ACCENT }}>
            {td("termsLink")}
          </Link>{" "}
          {td("and")}{" "}
          <Link href="/privacy" className="hover:underline" style={{ color: ACCENT }}>
            {td("privacyLink")}
          </Link>
          {td("termsEnd")}
        </span>
      </label>

      {/* Submit — gold pill, 40px tall */}
      <button
        type="submit"
        disabled={!agreed}
        className="w-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          height: "40px",
          padding: "8px 16px",
          borderRadius: `${FIELD_RADIUS}px`,
          backgroundColor: ACCENT,
          boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
          color: ACCENT_TEXT,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          textAlign: "center",
          border: "none",
          cursor: agreed ? "pointer" : "not-allowed",
        }}
      >
        {td("submit")}
      </button>

      {/* Go back */}
      <div className="flex flex-row items-end justify-center" style={{ gap: "4px" }}>
        <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: HELPER_COLOR }}>
          {td("homeBack")}
        </span>
        <Link href="/" className="hover:underline" style={{ fontFamily: SANS, fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: ACCENT }}>
          {td("homePage")}
        </Link>
      </div>
    </form>
  );
}
