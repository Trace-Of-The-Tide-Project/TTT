import type {
  ContentFormConfig,
  MainMediaEditorCopy,
} from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

function formNsKey(contentType: string): string {
  return contentType === "open-call" ? "openCall" : contentType;
}

/** Applies `Dashboard.articles.editor.forms.<type>.*` messages to a static editor config. */
export function localizeContentFormConfig(
  base: ContentFormConfig,
  t: (key: string) => string,
): ContentFormConfig {
  const ns = formNsKey(base.contentType);
  const prefix = `forms.${ns}`;
  const blockLabels = base.blockLabels
    ? (Object.fromEntries(
        Object.entries(base.blockLabels).map(([k]) => [k, t(`${prefix}.blockLabels.${k}`)]),
      ) as ContentFormConfig["blockLabels"])
    : undefined;
  return {
    ...base,
    titlePlaceholder: t(`${prefix}.titlePlaceholder`),
    settingsTitle: t(`${prefix}.settingsTitle`),
    primaryButtonLabel: t(`${prefix}.primaryButton`),
    blockLabels,
  };
}

function mainMediaNs(contentType: string | undefined): string {
  const ct = (contentType || "article").toLowerCase().replace(/-/g, "_");
  if (ct === "video") return "video";
  if (ct === "audio") return "audio";
  if (ct === "thread") return "thread";
  if (ct === "open_call" || ct === "opencall") return "openCall";
  return "article";
}

/** Applies `Dashboard.articles.editor.mainMedia.<variant>.*` for hero block copy. */
export function localizeMainMediaEditorCopy(
  contentType: string | undefined,
  t: (key: string) => string,
): MainMediaEditorCopy {
  const v = mainMediaNs(contentType);
  const p = `mainMedia.${v}`;
  return {
    blockName: t(`${p}.blockName`),
    uploadTitle: t(`${p}.uploadTitle`),
    uploadDetail: t(`${p}.uploadDetail`),
    pasteUrlHint: t(`${p}.pasteUrlHint`),
    addBlockButton: t(`${p}.addBlockButton`),
    missingHeroBlurb: t(`${p}.missingHeroBlurb`),
  };
}
