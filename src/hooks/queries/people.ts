import { useQuery } from "@tanstack/react-query";
import { getPeopleAdmin, getPerson, type GetPeopleParams } from "@/services/people.service";

export const peopleKeys = {
  all: ["people"] as const,
  adminList: (params?: GetPeopleParams) => ["people", "adminList", params ?? {}] as const,
  byId: (id: string) => ["people", "byId", id] as const,
};

export function usePeopleAdmin(params?: GetPeopleParams) {
  return useQuery({
    queryKey: peopleKeys.adminList(params),
    queryFn: () => getPeopleAdmin(params),
    placeholderData: (prev) => prev,
  });
}

export function usePerson(personId: string | null | undefined) {
  return useQuery({
    queryKey: peopleKeys.byId(personId ?? ""),
    queryFn: () => getPerson(personId as string),
    enabled: Boolean(personId),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
