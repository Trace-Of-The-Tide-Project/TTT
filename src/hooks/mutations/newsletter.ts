import { useMutation } from "@tanstack/react-query";
import {
  subscribeNewsletter,
  type SubscribeNewsletterPayload,
} from "@/services/newsletter.service";

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: (payload: SubscribeNewsletterPayload) =>
      subscribeNewsletter(payload),
  });
}
