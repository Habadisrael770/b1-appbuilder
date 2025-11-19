import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Edit2, Trash2, Eye } from "lucide-react";

export function DashboardMyApps() {
  const apps = [
    {
      id: 1,
      name: "My First App",
      website: "https://example.com",
      platform: "iOS & Android",
      status: "Ready",
      createdAt: "2024-01-15",
      downloads: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Apps</h1>
          <p className="text-gray-600 mt-2">Manage your converted mobile apps</p>
        </div>
        <Button className="bg-[#00A86B] hover:bg-[#008556] text-white">
          + New App
        </Button>
      </div>

      {apps.length === 0 ? (
        <Card className="border-0 shadow-sm p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No apps yet</h3>
            <p className="text-gray-600">Start by converting your first website to a mobile app</p>
            <Button className="bg-[#00A86B] hover:bg-[#008556] text-white">
              Create Your First App
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    App Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Website
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Platform
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{app.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 truncate">{app.website}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{app.platform}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{app.createdAt}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#00A86B] text-[#00A86B] hover:bg-[#E8F5E9]"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
