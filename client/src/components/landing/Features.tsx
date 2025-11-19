import { Zap, Bell, WifiOff, Store } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Instant Conversion",
      description: "Transform your website into a native mobile app in minutes with our automated conversion technology.",
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Engage your users with real-time push notifications to boost retention and user engagement.",
    },
    {
      icon: WifiOff,
      title: "Offline Mode",
      description: "Your app works seamlessly even without internet connection, providing uninterrupted user experience.",
    },
    {
      icon: Store,
      title: "App Store Ready",
      description: "Get your app published on iOS App Store and Google Play Store with our ready-to-submit packages.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose B1 AppBuilder
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to convert your website into a powerful mobile application
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#E8F5E9] rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#00A86B]" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
