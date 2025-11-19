import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useNotificationToast } from "@/hooks/useNotificationToast";
import { useState, useEffect } from "react";
import { Bell, Mail, Smartphone, Gift } from "lucide-react";

export function NotificationSettings() {
  const toast = useNotificationToast();
  const [settings, setSettings] = useState({
    emailNotifications: 1,
    pushNotifications: 1,
    desktopNotifications: 1,
    appUpdates: 1,
    paymentAlerts: 1,
    promotions: 0,
  });

  const getSettingsQuery = trpc.notifications.getSettings.useQuery();
  const updateSettingsMutation = trpc.notifications.updateSettings.useMutation();

  useEffect(() => {
    if (getSettingsQuery.data) {
      setSettings({
        emailNotifications: getSettingsQuery.data.emailNotifications,
        pushNotifications: getSettingsQuery.data.pushNotifications,
        desktopNotifications: getSettingsQuery.data.desktopNotifications,
        appUpdates: getSettingsQuery.data.appUpdates,
        paymentAlerts: getSettingsQuery.data.paymentAlerts,
        promotions: getSettingsQuery.data.promotions,
      });
    }
  }, [getSettingsQuery.data]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettingsMutation.mutateAsync(settings);
      toast.success("Settings saved", "Your notification preferences have been updated");
    } catch (error) {
      toast.error("Error", "Failed to save notification settings");
    }
  };

  const notificationOptions = [
    {
      key: "emailNotifications" as const,
      label: "Email Notifications",
      description: "Receive notifications via email",
      icon: Mail,
    },
    {
      key: "pushNotifications" as const,
      label: "Push Notifications",
      description: "Receive push notifications in your browser",
      icon: Bell,
    },
    {
      key: "desktopNotifications" as const,
      label: "Desktop Notifications",
      description: "Show desktop notifications when you're away",
      icon: Smartphone,
    },
    {
      key: "appUpdates" as const,
      label: "App Updates",
      description: "Get notified about new app features and updates",
      icon: Bell,
    },
    {
      key: "paymentAlerts" as const,
      label: "Payment Alerts",
      description: "Important alerts about your payments and subscriptions",
      icon: Bell,
    },
    {
      key: "promotions" as const,
      label: "Promotions & Offers",
      description: "Receive promotional offers and special deals",
      icon: Gift,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
        <p className="text-gray-600 mt-2">
          Manage how you receive notifications from B1 AppBuilder
        </p>
      </div>

      <div className="space-y-4">
        {notificationOptions.map(({ key, label, description, icon: Icon }) => (
          <Card key={key} className="p-4 border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key] === 1}
                  onChange={() => handleToggle(key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="bg-primary hover:bg-primary-dark text-white font-semibold"
        >
          {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
