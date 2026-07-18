import { api } from "./api";

export interface CmsSection {
  id: string;
  section_type: string;
  title: string;
  section_order: number;
  is_visible: boolean;
  config: Record<string, unknown> | null;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  page_type: string;
  status: "draft" | "published";
  updatedAt: string;
  sections: CmsSection[];
  content?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  language?: string;
}

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body && (body as { data?: unknown }).data !== undefined) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function getCmsHomepage(): Promise<CmsPage> {
  // The homepage is seeded under the slug "home" (page_type "homepage").
  // Querying "homepage" 404s — see seeders/seedCms.ts.
  return getCmsPageBySlug("home");
}

export async function getCmsPageBySlug(slug: string): Promise<CmsPage> {
  const res = await api.get(`/cms/pages/slug/${slug}`);
  return unwrap<CmsPage>(res.data);
}

export async function createCmsPage(data: {
  slug: string;
  title: string;
  page_type?: string;
}): Promise<CmsPage> {
  const res = await api.post("/cms/pages", {
    page_type: "landing",
    ...data,
  });
  return unwrap<CmsPage>(res.data);
}

export async function createCmsSection(
  pageId: string,
  data: {
    section_type: string;
    title: string;
    section_order: number;
    is_visible?: boolean;
    config?: string;
  },
): Promise<CmsSection> {
  const res = await api.post(`/cms/pages/${pageId}/sections`, {
    is_visible: true,
    ...data,
  });
  return unwrap<CmsSection>(res.data);
}

export async function getCmsPage(id: string): Promise<CmsPage> {
  const res = await api.get(`/cms/pages/${id}`);
  return unwrap<CmsPage>(res.data);
}

export async function updateCmsPage(
  id: string,
  data: {
    title?: string;
    content?: string;
    seo_title?: string;
    meta_description?: string;
    status?: "draft" | "published";
  },
): Promise<CmsPage> {
  const res = await api.patch(`/cms/pages/${id}`, data);
  return unwrap<CmsPage>(res.data);
}

export async function getCmsPages(): Promise<CmsPage[]> {
  const res = await api.get("/cms/pages");
  const body = unwrap<CmsPage[] | { pages?: CmsPage[] }>(res.data);
  if (Array.isArray(body)) return body;
  return (body as { pages?: CmsPage[] }).pages ?? [];
}

export async function updateCmsSection(
  pageId: string,
  sectionId: string,
  data: { title?: string; is_visible?: boolean; config?: string; section_order?: number },
): Promise<void> {
  await api.patch(`/cms/pages/${pageId}/sections/${sectionId}`, data);
}

export async function toggleCmsSection(pageId: string, sectionId: string): Promise<void> {
  await api.patch(`/cms/pages/${pageId}/sections/${sectionId}/toggle`);
}

export async function publishCmsPage(pageId: string): Promise<void> {
  await api.patch(`/cms/pages/${pageId}/publish`);
}

export async function getCmsSettings(): Promise<Record<string, unknown>> {
  const res = await api.get("/cms/settings");
  return unwrap<Record<string, unknown>>(res.data);
}

export async function updateCmsSetting(key: string, value: unknown): Promise<void> {
  await api.patch("/cms/settings", { key, value: JSON.stringify(value) });
}
