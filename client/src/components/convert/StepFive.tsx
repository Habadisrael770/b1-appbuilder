import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";

interface StepFiveProps {
  onNext: (plan: "BASIC" | "PRO" | "ENTERPRISE") => void;
  onBack: () => void;
}

export function StepFive({ onNext, onBack }: StepFiveProps) {
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PRO" | "ENTERPRISE">("PRO");

  const plans = [
    {
      id: "BASIC",
      name: "Basic",
      price: 29,
      description: "Perfect for getting started",
      features: [
        "1 App Conversion",
        "iOS & Android",
        "Basic Customization",
        "Email Support",
        "30-day money back guarantee",
      ],
    },
    {
      id: "PRO",
      name: "Pro",
      price: 99,
      description: "Most popular for growing businesses",
      features: [
        "5 App Conversions",
        "iOS & Android",
        "Advanced Customization",
        "Push Notifications",
        "Offline Mode",
        "Priority Support",
        "Custom Branding",
        "30-day money back guarantee",
      ],
      popular: true,
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise",
      price: 299,
      description: "For large-scale operations",
      features: [
        "Unlimited Apps",
        "iOS & Android",
        "White Label Solution",
        "API Access",
        "Dedicated Support",
        "Custom Features",
        "SLA Guarantee",
        "30-day money back guarantee",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 5: Choose Your Plan</h2>
        <p className="text-gray-600">
          Select the plan that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id as "BASIC" | "PRO" | "ENTERPRISE")}
            className={`cursor-pointer transition-all border-2 ${
              selectedPlan === plan.id
                ? "border-primary bg-primary-50 shadow-lg"
                : "border-gray-200 hover:border-primary-200"
            } ${plan.popular ? "md:ring-2 md:ring-primary md:ring-offset-2" : ""}`}
          >
            <div className="p-6 space-y-4">
              {plan.popular && (
                <div className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div>
                <h3 className="font-bold text-xl text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              </div>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-700">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPlan === plan.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <Card className="p-6 border-0 shadow-sm bg-blue-50 border border-blue-100 max-w-5xl mx-auto">
        <p className="text-sm text-gray-700">
          <strong>All plans include:</strong> 30-day money-back guarantee, instant app generation, and lifetime updates.
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center max-w-5xl mx-auto pt-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8 py-3 font-semibold"
        >
          Back
        </Button>
        <Button
          onClick={() => onNext(selectedPlan)}
          className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold"
        >
          Continue to Checkout
        </Button>
      </div>
    </div>
  );
}
