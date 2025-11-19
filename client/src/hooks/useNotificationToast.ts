import { useNotification } from "@/contexts/NotificationContext";
import { useCallback } from "react";

export function useNotificationToast() {
  const { showToast } = useNotification();

  const success = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast({
        type: "success",
        title,
        message,
        duration,
      });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast({
        type: "error",
        title,
        message,
        duration,
      });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast({
        type: "info",
        title,
        message,
        duration,
      });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message: string, duration?: number) => {
      showToast({
        type: "warning",
        title,
        message,
        duration,
      });
    },
    [showToast]
  );

  return { success, error, info, warning };
}
