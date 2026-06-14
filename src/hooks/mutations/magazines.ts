import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMagazine, type MagazineInput } from "@/services/magazines.service";
import { magazinesKeys } from "@/hooks/queries/magazines";

export function useCreateMagazine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MagazineInput) => createMagazine(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: magazinesKeys.all }),
    meta: { silent: true },
  });
}
