import { NextResponse, type NextRequest } from "next/server";
import { callBackend } from "@/lib/auth/proxy-backend";
import { routing } from "@/i18n/routing";

/**
 * Short share link: `/a/<article-id>` → the canonical localized article URL.
 *
 * Shared links otherwise carry a percent-encoded Arabic slug that expands to
 * hundreds of characters on X, WhatsApp and Instagram.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await callBackend({ path: `/articles/${encodeURIComponent(id)}` });

  const payload = result.ok ? (result.json as { data?: unknown } | null) : null;
  const article = (payload?.data ?? payload) as
    | { slug?: string; language?: string; content_type?: string }
    | null
    | undefined;

  const locale =
    article?.language && (routing.locales as readonly string[]).includes(article.language)
      ? article.language
      : routing.defaultLocale;

  const target = article?.slug
    ? `/${locale}/content/article/${encodeURIComponent(article.slug)}`
    : `/${locale}/content`;

  return NextResponse.redirect(new URL(target, _request.url), 307);
}
