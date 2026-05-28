import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/services/notifications.service";
import { notificationsKeys } from "@/hooks/queries/notifications";
import { useAuthUser } from "@/components/providers/AuthProvider";

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const user = useAuthUser();
  return useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("Not authenticated");
      return markAllNotificationsRead(user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationsKeys.all }),
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      updateNotificationPreferences(prefs),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: notificationsKeys.preferences() }),
  });
}
