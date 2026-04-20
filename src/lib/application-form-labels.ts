/** Keys that exist under `Dashboard.applicationForm.fieldNames.*` in locale files. */
const KNOWN_FIELD_LABEL_KEYS = new Set([
  "firstName",
  "lastName",
  "email",
  "phone",
  "experienceField",
  "about",
  "country",
  "city",
  "files",
  "termsAgreement",
  "fullName",
  "message",
]);

/**
 * camelCase key derived from API field name (`snake_case` or `kebab-case`).
 * Hyphens are treated like underscores; the name is lowercased first so
 * `Full_Name` / `full-name` both become `fullName`.
 */
export function nameToLabelKey(apiName: string): string {
  const normalized = apiName.trim().replace(/-/g, "_").toLowerCase();
  const parts = normalized.split("_").filter(Boolean);
  if (parts.length === 0) return "";
  return parts[0]! + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

/** Single-token or legacy API shapes → canonical `fieldNames` message key. */
const FIELD_LABEL_MESSAGE_KEY: Record<string, string> = {
  fullname: "fullName",
  firstname: "firstName",
  lastname: "lastName",
  phonenumber: "phone",
  phoneNumber: "phone",
  emailaddress: "email",
  emailAddress: "email",
};

export function humanizeFieldName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveApplicationFieldLabel(
  apiName: string,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string {
  const derived = nameToLabelKey(apiName);
  const messageKey = (FIELD_LABEL_MESSAGE_KEY as Record<string, string>)[derived] ?? derived;
  if (!KNOWN_FIELD_LABEL_KEYS.has(messageKey)) return humanizeFieldName(apiName);
  return t(`fieldNames.${messageKey}`);
}

/** Uses persisted `label` when set; otherwise resolves from `name` (i18n). */
export function resolveFieldParticipantLabel(
  field: { name: string; label?: string },
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string {
  const custom = field.label?.trim();
  if (custom) return custom;
  return resolveApplicationFieldLabel(field.name, t);
}

/** Option value → key under `selectOptions.*` (spaces → underscores). */
export function selectOptionMessageKey(option: string): string {
  return option.trim().replace(/\s+/g, "_");
}

/** Values that have entries under `selectOptions.*` in locale files. */
const KNOWN_SELECT_OPTION_KEYS = new Set([
  "Design",
  "Writing",
  "Photography",
  "Palestine",
  "Jordan",
  "Lebanon",
  "Ramallah",
  "Amman",
  "Beirut",
  "Option_A",
  "Option_B",
]);

export function resolveSelectOptionLabel(
  option: string,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string {
  const k = selectOptionMessageKey(option);
  if (!KNOWN_SELECT_OPTION_KEYS.has(k)) return option;
  return t(`selectOptions.${k}`);
}
