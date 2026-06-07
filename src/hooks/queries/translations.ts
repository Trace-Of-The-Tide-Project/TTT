import { useQuery } from "@tanstack/react-query";
import {
  getTranslations,
  type TranslatableType,
} from "@/services/translations.service";

export const translationKeys = {
  all: ["translations"] as const,
  group: (type: TranslatableType, id: string) =>
    ["translations", type, id] as const,
};

/**
 * Fetch the translation group (all language versions) for a piece of content.
 * Works across every translatable content type via the shared endpoint shape.
 */
export function useTranslations(
  type: TranslatableType,
  id: string | null | undefined,
) {
  return useQuery({
    queryKey: translationKeys.group(type, id ?? ""),
    queryFn: () => getTranslations(type, id as string),
    enabled: Boolean(id),
  });
}
