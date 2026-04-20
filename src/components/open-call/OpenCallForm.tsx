"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  PersonIcon,
  EmailIcon,
  CloudUploadIcon,
  ChevronDownIcon,
  FileTextIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { CONTRIBUTION_FORM_INPUT_BASE as inputBase, COUNTRY_CODES } from "@/lib/constants";

type UploadedFile = { id: string; file: File; sizeLabel: string };

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function PhoneIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h.01" />
      <path d="M2 8.82a15 15 0 0 1 20 0" />
      <path d="M5 12.859a10 10 0 0 1 14 0" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" />
    </svg>
  );
}

export function OpenCallForm() {
  const td = useTranslations("Dashboard.applicationForm.demoOpenCall");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
    [addFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const fieldRowStyle = {
    borderColor: theme.inputBorder,
    backgroundColor: theme.panelWellBackground,
  } as const;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full select-none space-y-5">
      {/* First name / Last name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">{td("firstName")}</label>
          <div
            className="flex items-center gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
            style={fieldRowStyle}
          >
            <span className="shrink-0 text-gray-500">
              <PersonIcon />
            </span>
            <input
              name="firstName"
              type="text"
              placeholder={td("firstNamePlaceholder")}
              className="w-full bg-transparent text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 focus:outline-none sm:text-base"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">{td("lastName")}</label>
          <div
            className="flex items-center gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
            style={fieldRowStyle}
          >
            <span className="shrink-0 text-gray-500">
              <PersonIcon />
            </span>
            <input
              name="lastName"
              type="text"
              placeholder={td("lastNamePlaceholder")}
              className="w-full bg-transparent text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 focus:outline-none sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">{td("email")}</label>
        <div
          className="flex items-center gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
          style={fieldRowStyle}
        >
          <span className="shrink-0 text-gray-500">
            <EmailIcon />
          </span>
          <input
            name="email"
            type="email"
            placeholder={td("emailPlaceholder")}
            className="w-full bg-transparent text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 focus:outline-none sm:text-base"
          />
        </div>
      </div>

      {/* Phone number */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">{td("phone")}</label>
        <div
          className="flex items-stretch overflow-hidden rounded-lg border"
          style={{ borderColor: theme.inputBorder }}
        >
          <div
            className="relative flex w-[100px] shrink-0 items-center border-r"
            style={fieldRowStyle}
          >
            <select
              name="countryCode"
              className="absolute inset-0 cursor-pointer appearance-none bg-transparent py-2 pl-8 pr-6 text-xs text-gray-400 focus:outline-none"
              defaultValue="+20"
            >
              {COUNTRY_CODES.map(({ code, country }) => (
                <option
                  key={code}
                  value={code}
                  className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]"
                >
                  {code} {country}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
              <PhoneIcon />
            </span>
          </div>
          <input
            name="phone"
            type="tel"
            placeholder={td("phonePlaceholder")}
            className={`${inputBase} min-w-0 flex-1 rounded-none border-0`}
            style={{ borderColor: "transparent" }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {td("phoneHint")}
        </p>
      </div>

      {/* Experience field */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">{td("experienceField")}</label>
        <div
          className="flex items-center gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
          style={fieldRowStyle}
        >
          <span className="shrink-0 text-gray-500">
            <WifiIcon />
          </span>
          <select
            name="experience"
            className="w-full appearance-none bg-transparent text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 focus:outline-none sm:text-base"
          >
            <option value="" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experiencePlaceholder")}
            </option>
            <option value="journalism" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experienceJournalism")}
            </option>
            <option value="research" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experienceResearch")}
            </option>
            <option value="photography" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experiencePhotography")}
            </option>
            <option value="filmmaking" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experienceFilmmaking")}
            </option>
            <option value="writing" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experienceWriting")}
            </option>
            <option value="art" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experienceArt")}
            </option>
            <option value="education" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experienceEducation")}
            </option>
            <option value="technology" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experienceTechnology")}
            </option>
            <option value="other" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
              {td("experienceOther")}
            </option>
          </select>
          <span className="pointer-events-none shrink-0 text-gray-500">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      {/* Tell us about yourself */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">
          {td("about")}
        </label>
        <textarea
          name="about"
          rows={4}
          placeholder={td("aboutPlaceholder")}
          className={inputBase}
          style={{ borderColor: theme.inputBorder }}
        />
      </div>

      {/* Country / City */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">{td("country")}</label>
          <div
            className="flex items-center gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
            style={fieldRowStyle}
          >
            <select
              name="country"
              className="w-full appearance-none bg-transparent text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 focus:outline-none sm:text-base"
            >
              <option value="" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
                {td("select")}
              </option>
              <option value="palestine" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
                {td("countryPalestine")}
              </option>
              <option value="egypt" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
                {td("countryEgypt")}
              </option>
              <option value="jordan" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
                {td("countryJordan")}
              </option>
              <option value="lebanon" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
                {td("countryLebanon")}
              </option>
              <option value="other" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
                {td("countryOther")}
              </option>
            </select>
            <span className="pointer-events-none shrink-0 text-gray-500">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">{td("city")}</label>
          <div
            className="flex items-center gap-3 rounded-lg border px-3 py-2 sm:px-4 sm:py-3"
            style={fieldRowStyle}
          >
            <select
              name="city"
              className="w-full appearance-none bg-transparent text-sm text-[color:var(--tott-panel-text)] placeholder:text-gray-500 focus:outline-none sm:text-base"
            >
              <option value="" className="bg-[var(--tott-well-bg)] text-[color:var(--tott-panel-text)]">
                {td("select")}
              </option>
            </select>
            <span className="pointer-events-none shrink-0 text-gray-500">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </div>

      {/* Upload files */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[color:var(--tott-panel-text)]">
          {td("uploadLabel")}{" "}
          <span className="font-normal text-gray-500">{td("uploadHint")}</span>
        </label>
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
            isDragging ? "border-[#C9A96E] bg-[#C9A96E]/10" : "border-gray-600 bg-[var(--tott-well-bg)]"
          }`}
        >
          <input
            type="file"
            multiple
            className="hidden"
            id="opencall-upload"
            onChange={(e) => addFiles(e.target.files)}
          />
          <label
            htmlFor="opencall-upload"
            className="flex cursor-pointer flex-col items-center gap-2 text-gray-400"
          >
            <span style={{ color: theme.accentGoldFocus }}>
              <CloudUploadIcon />
            </span>
            <span className="text-center text-sm">{td("uploadDrop")}</span>
            <span className="text-xs text-gray-500">{td("uploadFormats")}</span>
          </label>
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map(({ id, file, sizeLabel }) => (
              <li
                key={id}
                className="flex items-center gap-3 rounded-lg border border-gray-700 px-4 py-3"
                style={{ backgroundColor: theme.panelWellBackground }}
              >
                <span className="text-gray-500">
                  <FileTextIcon />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[color:var(--tott-panel-text)]">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">{sizeLabel}</span>
                <button
                  type="button"
                  onClick={() => removeFile(id)}
                  className="rounded p-1 text-gray-500 hover:bg-black/10 hover:text-[color:var(--tott-panel-text)] focus:outline-none focus:ring-2 focus:ring-[#C9A96E]"
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
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="h-4 w-4 rounded border-gray-600 bg-transparent accent-[#C9A96E] focus:ring-[#C9A96E]"
        />
        <span className="text-sm text-gray-400">
          {td("terms")}{" "}
          <Link href="/terms" className="hover:underline" style={{ color: theme.accentGold }}>
            {td("termsLink")}
          </Link>{" "}
          {td("and")}{" "}
          <Link href="/privacy" className="hover:underline" style={{ color: theme.accentGold }}>
            {td("privacyLink")}
          </Link>
          {td("termsEnd")}
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={!agreed}
        className="w-full cursor-pointer rounded-lg py-3.5 text-base font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        style={{
          backgroundColor: theme.accentGold,
          boxShadow: `0 0 0 1px ${theme.accentGold}`,
          color: theme.bgDark,
        }}
      >
        {td("submit")}
      </button>

      {/* Go back */}
      <p className="text-center text-sm text-gray-400">
        {td("homeBack")}{" "}
        <Link href="/" className="hover:underline" style={{ color: theme.accentGold }}>
          {td("homePage")}
        </Link>
      </p>
    </form>
  );
}
