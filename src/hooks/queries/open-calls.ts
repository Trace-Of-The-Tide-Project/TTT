import { useQuery } from "@tanstack/react-query";
import { getOpenCallById } from "@/services/open-calls.service";

export const openCallsKeys = {
  all: ["open-calls"] as const,
  byId: (id: string) => ["open-calls", "byId", id] as const,
};

export function useOpenCall(id: string | null | undefined) {
  return useQuery({
    queryKey: openCallsKeys.byId(id ?? ""),
    queryFn: () => getOpenCallById(id as string),
    enabled: Boolean(id),
  });
}
