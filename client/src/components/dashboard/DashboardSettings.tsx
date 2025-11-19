import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Lock, User, Trash2 } from "lucide-react";
import { useState } from "react";

export function DashboardSettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="border-0 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-[#00A86B]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <input
              type="text"
              placeholder="Your Company"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
            />
          </div>

          <Button className="bg-[#00A86B] hover:bg-[#008556] text-white">
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Password Settings */}
      <Card className="border-0 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Password & Security</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Update Password
          </Button>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="border-0 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              key: "email",
              label: "Email Notifications",
              description: "Receive updates via email",
            },
            {
              key: "push",
              label: "Push Notifications",
              description: "Receive push notifications on your device",
            },
            {
              key: "marketing",
              label: "Marketing Emails",
              description: "Receive promotional emails and updates",
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <button
                onClick={() => handleNotificationChange(item.key as keyof typeof notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications]
                    ? "bg-[#00A86B]"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-sm p-6 border-l-4 border-red-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-900 font-medium mb-2">Delete Account</p>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
