import { toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";

export type MutationToastConfig = {
  loading: string;
  success: string;
  error?: string;
};

export function mutationToast<T>(
  fn: () => Promise<T>,
  config: MutationToastConfig,
): Promise<T> {
  return toast.promise(fn(), {
    loading: config.loading,
    success: config.success,
    error: (err) => formatApiError(err, config.error ?? "Something went wrong"),
  }) as unknown as Promise<T>;
}
