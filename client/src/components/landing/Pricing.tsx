import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Basic",
      monthlyPrice: 29,
      description: "Perfect for getting started",
      features: [
        "1 App Conversion",
        "iOS & Android",
        "Basic Customization",
        "Email Support",
      ],
      notIncluded: ["Push Notifications", "Offline Mode", "Priority Support"],
      cta: "Choose Basic",
      variant: "outline" as const,
    },
    {
      name: "Pro",
      monthlyPrice: 99,
      description: "Most popular for growing businesses",
      features: [
        "5 App Conversions",
        "iOS & Android",
        "Advanced Customization",
        "Push Notifications",
        "Offline Mode",
        "Priority Support",
        "Custom Branding",
      ],
      notIncluded: [],
      cta: "Choose Pro",
      variant: "default" as const,
      popular: true,
    },
    {
      name: "Enterprise",
      monthlyPrice: 299,
      description: "For large-scale operations",
      features: [
        "Unlimited Apps",
        "iOS & Android",
        "White Label Solution",
        "API Access",
        "Dedicated Support",
        "Custom Features",
        "SLA Guarantee",
      ],
      notIncluded: [],
      cta: "Contact Sales",
      variant: "outline" as const,
    },
  ];

  const getPrice = (monthlyPrice: number) => {
    if (isAnnual) {
      return Math.floor(monthlyPrice * 12 * 0.8);
    }
    return monthlyPrice;
  };

  return (
    <section id="pricing" className="py-20 md:py-32 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start free, upgrade as you grow
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`font-semibold ${!isAnnual ? "text-gray-900" : "text-gray-600"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isAnnual ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAnnual ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`font-semibold ${isAnnual ? "text-gray-900" : "text-gray-600"}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-primary text-white ml-2">Save 20%</Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-0 shadow-lg transition-transform hover:scale-105 ${
                plan.popular ? "md:scale-105 ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                  Most Popular
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${getPrice(plan.monthlyPrice)}
                    </span>
                    <span className="text-gray-600">
                      {isAnnual ? "/year" : "/month"}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Included Features */}
                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Not Included Features */}
                {plan.notIncluded.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-gray-200">
                    {plan.notIncluded.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 opacity-50">
                        <div className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 line-through">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA Button */}
                <Button
                  variant={plan.variant}
                  className={`w-full font-semibold py-2 ${
                    plan.variant === "default"
                      ? "bg-primary hover:bg-primary-dark text-white"
                      : "border-primary text-primary hover:bg-primary-50"
                  }`}
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
