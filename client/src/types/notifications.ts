export type Notification = {
  id: number;
  userId: number;
  type: "SUCCESS" | "ERROR" | "INFO" | "WARNING";
  title: string;
  message: string;
  isRead: number;
  actionUrl?: string;
  createdAt: Date;
};

export type NotificationSettings = {
  id: number;
  userId: number;
  emailNotifications: number;
  pushNotifications: number;
  desktopNotifications: number;
  appUpdates: number;
  paymentAlerts: number;
  promotions: number;
  createdAt: Date;
  updatedAt: Date;
};
