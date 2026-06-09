import { useQuery } from "@tanstack/react-query";
import { getPrivacy } from "@/services/privacy.service";

export const privacyKeys = {
  all: ["privacy"] as const,
  detail: () => ["privacy", "detail"] as const,
};

export function usePrivacy() {
  return useQuery({
    queryKey: privacyKeys.detail(),
    queryFn: getPrivacy,
  });
}
