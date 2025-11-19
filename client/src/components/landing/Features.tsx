import { Zap, Bell, WifiOff, Package } from "lucide-react";
import { useEffect, useState } from "react";

export function Features() {
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

    const element = document.getElementById("features");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Instant Conversion",
      description:
        "Transform your website into a native mobile app in minutes with our automated conversion technology.",
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description:
        "Engage your users with real-time push notifications to boost retention and user engagement.",
    },
    {
      icon: WifiOff,
      title: "Offline Mode",
      description:
        "Your app works seamlessly even without internet connection, providing uninterrupted user experience.",
    },
    {
      icon: Package,
      title: "App Store Ready",
      description:
        "Get your app published on iOS App Store and Google Play Store with our ready-to-submit packages.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 lg:py-40 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Why Choose{" "}
            <span className="text-[#00A86B]">B1 AppBuilder</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Everything you need to transform your website into a powerful mobile
            application
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                <div className="h-full bg-white border-2 border-gray-200 rounded-2xl p-8 transition-all duration-300 hover:border-[#00A86B] hover:shadow-xl hover:-translate-y-1">
                  {/* Icon Container */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E8F5E9] rounded-2xl mb-6 transition-all duration-300 group-hover:bg-[#00A86B]">
                    <Icon className="w-8 h-8 text-[#00A86B] transition-colors duration-300 group-hover:text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-lg font-semibold text-gray-900 mb-4 leading-snug">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
