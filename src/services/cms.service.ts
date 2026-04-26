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
}

function unwrap<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body && (body as { data?: unknown }).data !== undefined) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function getCmsHomepage(): Promise<CmsPage> {
  const res = await api.get("/cms/pages/slug/homepage");
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
