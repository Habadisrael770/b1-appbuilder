import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("pricing");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const plans = [
    {
      name: "Free Trial",
      monthlyPrice: 0,
      description: "14 days to explore Pro features",
      features: [
        "5 App Conversions",
        "iOS & Android",
        "Advanced Customization",
        "Push Notifications",
        "Offline Mode",
        "Priority Support",
      ],
      notIncluded: [],
      cta: "Start Free Trial",
      variant: "outline" as const,
      badge: "14 Days Free",
    },
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
    <section id="pricing" className="py-20 md:py-32 lg:py-40 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Choose Your Plan
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
            Start free, upgrade as you grow
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <span
              className={`font-semibold text-base transition-colors ${
                !isAnnual ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300 ${
                isAnnual ? "bg-[#00A86B]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white transition-transform duration-300 ${
                  isAnnual ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`font-semibold text-base transition-colors ${
                isAnnual ? "text-gray-900" : "text-gray-600"
              }`}
            >
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-[#00A86B] text-white ml-3 text-xs">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              <div
                className={`relative h-full rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  plan.popular
                    ? "border-[#00A86B] bg-gradient-to-br from-[#E8F5E9] to-white shadow-xl scale-105 md:scale-100 lg:scale-105"
                    : "border-gray-200 bg-white hover:border-[#00A86B] hover:shadow-lg"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-[#00A86B] text-white text-xs font-semibold px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-8 flex flex-col h-full">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.monthlyPrice === 0 ? "Free" : `$${getPrice(plan.monthlyPrice)}`}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-gray-600 text-base">
                          {isAnnual ? "/year" : "/month"}
                        </span>
                      )}
                    </div>
                    {plan.badge && (
                      <p className="text-sm text-[#00A86B] font-semibold mt-3">
                        {plan.badge}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8 flex-grow">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}

                    {/* Not Included Features */}
                    {plan.notIncluded.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        {plan.notIncluded.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-3 opacity-50"
                          >
                            <div className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-500 line-through text-sm">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full font-semibold py-3 rounded-xl transition-all duration-200 text-base ${
                      plan.variant === "default"
                        ? "bg-[#00A86B] hover:bg-[#008556] text-white shadow-md hover:shadow-lg"
                        : "border-2 border-[#00A86B] text-[#00A86B] hover:bg-[#E8F5E9] bg-white"
                    }`}
                    onClick={() => (window.location.href = getLoginUrl())}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
