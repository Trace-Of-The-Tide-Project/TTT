import type { ApplicationFormValidationIssue } from "@/services/open-calls.service";

/** Maps validation issue codes to `Dashboard.applicationForm.validation.*` keys. */
export function formatApplicationFormValidationIssue(
  issue: ApplicationFormValidationIssue,
  t: (key: string, values?: Record<string, string | number>) => string,
  /** When set, raw API field names in messages are shown as localized labels (e.g. الاسم الكامل). */
  fieldDisplayName?: (apiFieldName: string) => string,
): string {
  const label = (name: string) => fieldDisplayName?.(name) ?? name;

  switch (issue.code) {
    case "no_fields":
      return t("validation.noFields");
    case "empty_field_name":
      return t("validation.emptyFieldName");
    case "duplicate_name":
      return t("validation.duplicateName", { name: label(issue.name) });
    case "select_no_options":
      return t("validation.selectNoOptions", { name: label(issue.name) });
    case "file_max_files":
      return t("validation.fileMaxFiles", { name: label(issue.name) });
    case "file_no_types":
      return t("validation.fileNoTypes", { name: label(issue.name) });
    case "file_max_size":
      return t("validation.fileMaxSize", { name: label(issue.name) });
    default:
      return t("validation.generic");
  }
}
