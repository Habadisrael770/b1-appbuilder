import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Download } from "lucide-react";

export function DashboardBilling() {
  const currentPlan = {
    name: "Free",
    price: 0,
    features: [
      "Up to 1 app",
      "Basic support",
      "Community access",
    ],
  };

  const paymentHistory = [
    {
      id: 1,
      date: "2024-01-15",
      description: "Pro Plan - Monthly",
      amount: "$99.00",
      status: "Paid",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-600 mt-2">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <Card className="border-0 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Current Plan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Plan Name</p>
            <p className="text-2xl font-bold text-gray-900">{currentPlan.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium mb-2">Price</p>
            <p className="text-2xl font-bold text-[#00A86B]">
              ${currentPlan.price}
              <span className="text-sm text-gray-600">/month</span>
            </p>
          </div>
          <div className="flex items-end">
            <Button className="bg-[#00A86B] hover:bg-[#008556] text-white w-full">
              Upgrade Plan
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-900 mb-4">Included Features</p>
          <ul className="space-y-2">
            {currentPlan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-gray-600">
                <div className="w-2 h-2 bg-[#00A86B] rounded-full"></div>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="border-0 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">No payment method added</p>
              <p className="text-sm text-gray-600">Add a card to upgrade your plan</p>
            </div>
          </div>
          <Button variant="outline">Add Card</Button>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="border-0 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Payment History</h2>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No payments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {payment.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button size="sm" variant="ghost">
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Billing Address */}
      <Card className="border-0 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Billing Address</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
            />
          </div>
          <Button className="bg-[#00A86B] hover:bg-[#008556] text-white">
            Save Address
          </Button>
        </div>
      </Card>
    </div>
  );
}
