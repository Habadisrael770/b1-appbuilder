import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Edit2 } from "lucide-react";

interface StepFourProps {
  appData: {
    appName: string;
    websiteUrl: string;
    platform: "IOS" | "ANDROID" | "BOTH";
    primaryColor: string;
    secondaryColor?: string;
  };
  onNext: () => void;
  onBack: () => void;
}

export function StepFour({ appData, onNext, onBack }: StepFourProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 4: Preview Your App</h2>
        <p className="text-gray-600">
          Here's how your app will look with your customizations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Phone Mockup */}
        <div className="flex justify-center items-center">
          <div className="relative w-64 h-96">
            {/* iPhone Mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>

              {/* Screen Content */}
              <div className="w-full h-full flex flex-col items-center justify-center p-6 pt-10"
                style={{ backgroundColor: appData.primaryColor }}>
                <div className="w-16 h-16 bg-white rounded-2xl mb-4 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold" style={{ color: appData.primaryColor }}>
                    {appData.appName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-center text-white font-semibold text-sm">
                  {appData.appName}
                </p>
                <p className="text-center text-white text-xs mt-2 opacity-80">
                  Powered by B1 AppBuilder
                </p>
              </div>
            </div>

            {/* Shadow */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-black/20 rounded-full blur-lg"></div>
          </div>
        </div>

        {/* App Details */}
        <div className="space-y-6">
          <Card className="p-6 border-0 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4">App Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">App Name</p>
                <p className="font-semibold text-gray-900">{appData.appName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Website URL</p>
                <p className="font-semibold text-gray-900 break-all">{appData.websiteUrl}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="font-semibold text-gray-900">
                  {appData.platform === "BOTH"
                    ? "iOS & Android"
                    : appData.platform === "IOS"
                      ? "iOS"
                      : "Android"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-sm">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Colors</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg shadow-sm"
                  style={{ backgroundColor: appData.primaryColor }}
                ></div>
                <div>
                  <p className="text-sm text-gray-600">Primary Color</p>
                  <p className="font-semibold text-gray-900">{appData.primaryColor}</p>
                </div>
              </div>
              {appData.secondaryColor && (
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg shadow-sm"
                    style={{ backgroundColor: appData.secondaryColor }}
                  ></div>
                  <div>
                    <p className="text-sm text-gray-600">Secondary Color</p>
                    <p className="font-semibold text-gray-900">{appData.secondaryColor}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Features Included */}
          <Card className="p-6 border-0 shadow-sm bg-primary-50 border border-primary-100">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Included Features</h3>
            <div className="space-y-3">
              {[
                "Push Notifications",
                "Offline Mode",
                "App Store Ready",
                "Custom Branding",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
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
          onClick={onNext}
          className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold"
        >
          Continue to Pricing
        </Button>
      </div>
    </div>
  );
}
