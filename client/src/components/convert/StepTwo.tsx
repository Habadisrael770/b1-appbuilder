import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Apple, Smartphone } from "lucide-react";
import { useState } from "react";

interface StepTwoProps {
  onNext: (platform: "IOS" | "ANDROID" | "BOTH") => void;
  onBack: () => void;
}

export function StepTwo({ onNext, onBack }: StepTwoProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<"IOS" | "ANDROID" | "BOTH">("BOTH");

  const platforms = [
    {
      id: "IOS",
      name: "iOS Only",
      icon: Apple,
      description: "Launch your app on Apple App Store",
      features: ["iPhone & iPad", "App Store submission", "iOS optimized"],
    },
    {
      id: "ANDROID",
      name: "Android Only",
      icon: Smartphone,
      description: "Launch your app on Google Play Store",
      features: ["Android phones & tablets", "Google Play submission", "Android optimized"],
    },
    {
      id: "BOTH",
      name: "iOS & Android",
      icon: Smartphone,
      description: "Launch on both platforms (Recommended)",
      features: ["Maximum reach", "Both App Stores", "Cross-platform optimized"],
      recommended: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 2: Select Your Platform</h2>
        <p className="text-gray-600">
          Choose which platform(s) you want to launch your app on
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;

          return (
            <Card
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id as "IOS" | "ANDROID" | "BOTH")}
              className={`cursor-pointer transition-all border-2 ${
                isSelected
                  ? "border-primary bg-primary-50 shadow-lg"
                  : "border-gray-200 hover:border-primary-200"
              } ${platform.recommended ? "md:ring-2 md:ring-primary md:ring-offset-2" : ""}`}
            >
              <div className="p-6 space-y-4">
                {platform.recommended && (
                  <div className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Recommended
                  </div>
                )}

                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{platform.description}</p>
                </div>

                <ul className="space-y-2">
                  {platform.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center max-w-4xl mx-auto pt-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8 py-3 font-semibold"
        >
          Back
        </Button>
        <Button
          onClick={() => onNext(selectedPlatform)}
          className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
