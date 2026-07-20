import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFraming, upsertFraming } from "@/services/image-framing.service";
import { imageFramingKeys } from "@/hooks/queries/image-framing";
import type { ImageFraming } from "@/lib/image-framing";

export type FramingPlacement = {
  entityType: string;
  entityId: string;
  field: string;
};

/**
 * Save or reset framing for one placement. `framing: undefined` means default,
 * which deletes the row — so the editor's Apply button has a single call path
 * whether the admin adjusted the image or reset it.
 */
export function useSaveImageFraming() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      field,
      framing,
    }: FramingPlacement & { framing: ImageFraming | undefined }) =>
      framing
        ? upsertFraming(entityType, entityId, field, framing)
        : deleteFraming(entityType, entityId, field),
    onSuccess: () => qc.invalidateQueries({ queryKey: imageFramingKeys.all }),
  });
}
