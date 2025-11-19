import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Home, Package, CreditCard, Settings, Menu, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { DashboardMyApps } from "@/components/dashboard/DashboardMyApps";
import { DashboardBilling } from "@/components/dashboard/DashboardBilling";
import { DashboardSettings } from "@/components/dashboard/DashboardSettings";

type DashboardTab = "overview" | "apps" | "billing" | "settings";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "apps", label: "My Apps", icon: Package },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00A86B] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B1</span>
            </div>
            <span className="font-bold text-lg text-[#00A86B]">AppBuilder</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as DashboardTab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-[#E8F5E9] text-[#00A86B] font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-red-600 border-red-200 hover:bg-red-50 justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as DashboardTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-[#E8F5E9] text-[#00A86B] font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-6 left-6 right-6 space-y-4">
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                  <p className="text-gray-600 mt-2">Here's an overview of your account</p>
                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-sm p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Total Apps</p>
                      <p className="text-4xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-500">No apps yet</p>
                    </div>
                  </Card>

                  <Card className="border-0 shadow-sm p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Current Plan</p>
                      <p className="text-2xl font-bold text-[#00A86B]">Free</p>
                      <p className="text-xs text-gray-500">Upgrade to Pro</p>
                    </div>
                  </Card>

                  <Card className="border-0 shadow-sm p-6">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 font-medium">Account Status</p>
                      <p className="text-2xl font-bold text-green-600">Active</p>
                      <p className="text-xs text-gray-500">All systems operational</p>
                    </div>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-0 shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button className="bg-[#00A86B] hover:bg-[#008556] text-white h-12 justify-start text-base">
                      + Create New App
                    </Button>
                    <Button variant="outline" className="h-12 justify-start text-base">
                      View Documentation
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* My Apps Tab */}
            {activeTab === "apps" && <DashboardMyApps />}

            {/* Billing Tab */}
            {activeTab === "billing" && <DashboardBilling />}

            {/* Settings Tab */}
            {activeTab === "settings" && <DashboardSettings />}
          </div>
        </main>
      </div>
    </div>
  );
}
