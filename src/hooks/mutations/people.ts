import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPerson,
  updatePerson,
  deletePerson,
  type PersonProfilePayload,
} from "@/services/people.service";
import { peopleKeys } from "@/hooks/queries/people";

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PersonProfilePayload) => createPerson(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: peopleKeys.all }),
    meta: { silent: true },
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { personId: string; payload: Partial<PersonProfilePayload> }) =>
      updatePerson(args.personId, args.payload),
    onSuccess: (_d, args) => {
      qc.invalidateQueries({ queryKey: peopleKeys.byId(args.personId) });
      qc.invalidateQueries({ queryKey: peopleKeys.all });
    },
    meta: { silent: true },
  });
}

export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (personId: string) => deletePerson(personId),
    onSuccess: () => qc.invalidateQueries({ queryKey: peopleKeys.all }),
    meta: { silent: true },
  });
}
