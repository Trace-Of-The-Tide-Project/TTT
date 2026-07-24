import type {
  TranslatableType,
  TranslationVersion,
} from "@/services/translations.service";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";

export const DEFAULT_TRANSLATION_VIEW_PATH = "/content/article";

/**
 * Where a sibling language version of a piece of content is readable.
 *
 * Articles are the special case: each version is its own `articles` row and
 * may sit on a different reader than the one currently open — magazine-product
 * rows only render under `/magazine*` (the main-site reader rejects them as a
 * product mismatch and shows "not found"), and video/audio/gallery/thread rows
 * have their own routes. Falls back to the `?id=` reader when the backend
 * hasn't sent product/content_type (or for every other translatable type,
 * which all share the generic `?id=` reader shape).
 *
 * Shared by `AvailableLanguagesBadge` and `ContentLanguageNotice` so the two
 * "switch language" surfaces never drift apart.
 */
export function resolveVersionHref(
  contentType: TranslatableType,
  version: TranslationVersion,
  viewBasePath: string = DEFAULT_TRANSLATION_VIEW_PATH,
): string {
  if (contentType !== "article" || (!version.product && !version.content_type)) {
    return `${viewBasePath}?id=${encodeURIComponent(version.id)}`;
  }
  return previewHrefForContentType(
    version.content_type ?? undefined,
    version.id,
    version.slug,
    version.product ?? undefined,
  );
}
