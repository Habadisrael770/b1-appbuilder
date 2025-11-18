import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Bell, WifiOff, Store } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Zap,
      title: "Instant Conversion",
      description: "Transform your website into a native mobile app in minutes",
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Engage users with real-time push notifications",
    },
    {
      icon: WifiOff,
      title: "Offline Mode",
      description: "Your app works even without internet connection",
    },
    {
      icon: Store,
      title: "App Store Ready",
      description: "Get your app published on iOS and Android stores",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-white">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose B1 AppBuilder
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to convert your website into a powerful mobile application
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
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
