import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  publishCmsPage,
  toggleCmsSection,
  updateCmsPage,
  updateCmsSection,
  updateCmsSetting,
} from "@/services/cms.service";
import { cmsKeys } from "@/hooks/queries/cms";

type UpdateSectionArgs = {
  pageId: string;
  sectionId: string;
  data: {
    title?: string;
    is_visible?: boolean;
    config?: string;
    section_order?: number;
  };
};

export function useUpdateCmsSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: UpdateSectionArgs) =>
      updateCmsSection(args.pageId, args.sectionId, args.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: cmsKeys.all }),
  });
}

export function useToggleCmsSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { pageId: string; sectionId: string }) =>
      toggleCmsSection(args.pageId, args.sectionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cmsKeys.all }),
  });
}

export function useUpdateCmsPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: string;
      data: {
        title?: string;
        content?: string;
        seo_title?: string;
        meta_description?: string;
        status?: "draft" | "published";
      };
    }) => updateCmsPage(args.id, args.data),
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: cmsKeys.pageById(args.id) });
      qc.invalidateQueries({ queryKey: cmsKeys.pages() });
    },
  });
}

export function usePublishCmsPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => publishCmsPage(pageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: cmsKeys.all }),
  });
}

export function useUpdateCmsSetting(options?: { silent?: boolean }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { key: string; value: unknown }) =>
      updateCmsSetting(args.key, args.value),
    onSuccess: () => qc.invalidateQueries({ queryKey: cmsKeys.settings() }),
    meta: options?.silent ? { silent: true } : undefined,
  });
}
