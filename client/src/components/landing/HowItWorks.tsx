import { Link, Palette, Download, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export function HowItWorks() {
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

    const element = document.getElementById("how-it-works");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: "1",
      icon: Link,
      title: "Enter URL",
      description: "Paste your website URL and let us analyze it",
    },
    {
      number: "2",
      icon: Palette,
      title: "Customize Design",
      description: "Add your branding, colors, and app icon",
    },
    {
      number: "3",
      icon: Download,
      title: "Download & Deploy",
      description: "Get your app files instantly and publish",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-32 lg:py-40 bg-gray-50"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Three Simple Steps
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            From website to mobile app in just a few minutes
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                <div className="relative h-full">
                  {/* Step Card */}
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 h-full transition-all duration-300 hover:border-[#00A86B] hover:shadow-lg">
                    {/* Step Number Badge */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00A86B] rounded-full mb-6 flex-shrink-0">
                      <span className="text-white font-bold text-2xl">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="mb-6">
                      <Icon className="w-8 h-8 text-[#00A86B]" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-base text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector Arrow (Desktop Only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-8 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="flex items-center justify-center w-6 h-6 bg-[#00A86B] rounded-full">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
