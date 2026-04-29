import { useQuery } from "@tanstack/react-query";
import {
  getNotificationPreferences,
  getNotifications,
  type GetNotificationsParams,
} from "@/services/notifications.service";

export const notificationsKeys = {
  all: ["notifications"] as const,
  list: (params?: GetNotificationsParams) =>
    ["notifications", "list", params ?? {}] as const,
  preferences: () => ["notifications", "preferences"] as const,
};

export function useNotifications(
  params?: GetNotificationsParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => getNotifications(params),
    enabled: options?.enabled ?? true,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationsKeys.preferences(),
    queryFn: getNotificationPreferences,
  });
}
