import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { Notification } from "@/types/notifications";

export type ToastNotification = {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
};

interface NotificationContextType {
  // Toast notifications (temporary)
  toasts: ToastNotification[];
  showToast: (notification: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;

  // In-app notifications (persistent)
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const showToast = useCallback((notification: Omit<ToastNotification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = notification.duration || 4000;

    setToasts((prev) => [...prev, { ...notification, id }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        notifications,
        unreadCount,
        setNotifications,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
