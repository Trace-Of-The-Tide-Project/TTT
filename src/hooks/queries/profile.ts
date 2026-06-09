import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/profile.service";

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => ["profile", "detail"] as const,
};

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: getProfile,
  });
}
