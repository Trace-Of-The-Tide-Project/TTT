import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { callBackend } from "@/lib/auth/proxy-backend";
import { isCmsPreviewAuthorized } from "@/lib/auth/cms-preview-gate";
import { SupportPageLayout } from "@/components/layout/SupportPageLayout";
import { RichContent } from "@/components/ui/rich-text";
import { dirFor } from "@/i18n/dir";

type CmsPageData = {
  id: string;
  title: string;
  slug: string;
  content?: string | null;
  status: "draft" | "published";
  seo_title?: string | null;
  meta_description?: string | null;
  language?: string;
};

async function fetchPage(slug: string): Promise<CmsPageData | null> {
  const result = await callBackend({ path: `/cms/pages/slug/${encodeURIComponent(slug)}` });
  if (!result.ok) return null;
  const body = result.json as { data?: CmsPageData } | CmsPageData | null;
  const page = body && typeof body === "object" && "data" in body ? body.data : (body as CmsPageData | null);
  return page?.id ? page : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPage(slug);
  if (!page || page.status !== "published") return {};
  return {
    title: page.seo_title || page.title,
    description: page.meta_description || undefined,
  };
}

export default async function CmsStaticPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cmsPreview?: string }>;
}) {
  const { slug } = await params;
  const { cmsPreview } = await searchParams;
  const page = await fetchPage(slug);

  if (!page) notFound();

  // Draft/unpublished pages are only ever visible with a verified admin
  // preview request — see src/lib/auth/cms-preview-gate.ts. Every other
  // caller (including any request missing the flag) keeps the original
  // published-only gate untouched.
  const previewAuthorized = cmsPreview === "1" && (await isCmsPreviewAuthorized());
  if (page.status !== "published" && !previewAuthorized) notFound();

  return (
    <SupportPageLayout title={page.title}>
      <RichContent html={page.content} dir={dirFor(page.language)} />
    </SupportPageLayout>
  );
}
