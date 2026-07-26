import { NextResponse, type NextRequest } from "next/server";
import { callBackend } from "@/lib/auth/proxy-backend";
import { routing } from "@/i18n/routing";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";

/**
 * Short share link: `/a/<article-id>` → the canonical localized article URL.
 *
 * Shared links otherwise carry a percent-encoded Arabic slug that expands to
 * hundreds of characters on X, WhatsApp and Instagram.
 *
 * Must route through `previewHrefForContentType` (product/content_type aware)
 * rather than always `/content/article/[slug]` — a magazine-product article
 * (or a video/audio/gallery/thread) landing on the main-site article reader
 * trips its productMismatch guard and renders "not found" even though the
 * article exists.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await callBackend({ path: `/articles/${encodeURIComponent(id)}` });

  const payload = result.ok ? (result.json as { data?: unknown } | null) : null;
  const article = (payload?.data ?? payload) as
    | { slug?: string; language?: string; content_type?: string; product?: string }
    | null
    | undefined;

  const locale =
    article?.language && (routing.locales as readonly string[]).includes(article.language)
      ? article.language
      : routing.defaultLocale;

  const target = article
    ? `/${locale}${previewHrefForContentType(article.content_type, id, article.slug, article.product)}`
    : `/${locale}/content`;

  return NextResponse.redirect(new URL(target, _request.url), 307);
}
