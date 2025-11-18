import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Palette, Download } from "lucide-react";

export function HowItWorks() {
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
    <section className="py-20 md:py-32 bg-gray-50">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Three Simple Steps
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From website to mobile app in just a few minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                <Card className="border-0 shadow-md h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xl">{step.number}</span>
                      </div>
                      <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-gray-600">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-primary"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
