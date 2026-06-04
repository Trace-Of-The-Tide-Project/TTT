import { useQuery } from "@tanstack/react-query";
import {
  getNotificationPreferences,
  getNotifications,
  getUnreadNotificationCount,
  type GetNotificationsParams,
} from "@/services/notifications.service";

export const notificationsKeys = {
  all: ["notifications"] as const,
  list: (params?: GetNotificationsParams) =>
    ["notifications", "list", params ?? {}] as const,
  unreadCount: (userId: string | null | undefined) =>
    ["notifications", "unread-count", userId ?? ""] as const,
  preferences: () => ["notifications", "preferences"] as const,
};

export function useNotifications(
  params?: GetNotificationsParams,
  options?: { enabled?: boolean; silent?: boolean },
) {
  return useQuery({
    queryKey: notificationsKeys.list(params),
    queryFn: () => getNotifications(params),
    enabled: options?.enabled ?? true,
    meta: options?.silent ? { silent: true } : undefined,
  });
}

/** Unread count for the badge — scoped to one user via the backend count endpoint. */
export function useUnreadNotificationCount(
  userId: string | null | undefined,
  options?: { silent?: boolean },
) {
  return useQuery({
    queryKey: notificationsKeys.unreadCount(userId),
    queryFn: () => getUnreadNotificationCount(userId as string),
    enabled: Boolean(userId),
    meta: options?.silent ? { silent: true } : undefined,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationsKeys.preferences(),
    queryFn: getNotificationPreferences,
  });
}
