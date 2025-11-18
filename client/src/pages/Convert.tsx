import { useState } from "react";
import { StepOne } from "@/components/convert/StepOne";
import { StepTwo } from "@/components/convert/StepTwo";
import { StepThree } from "@/components/convert/StepThree";
import { StepFour } from "@/components/convert/StepFour";
import { StepFive } from "@/components/convert/StepFive";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ConversionStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface ConversionState {
  websiteUrl: string;
  platform: "IOS" | "ANDROID" | "BOTH";
  appName: string;
  primaryColor: string;
  secondaryColor?: string;
  plan?: "BASIC" | "PRO" | "ENTERPRISE";
}

export default function Convert() {
  const [currentStep, setCurrentStep] = useState<ConversionStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [conversionData, setConversionData] = useState<Partial<ConversionState>>({});

  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;

  const handleStepOne = (websiteUrl: string) => {
    setConversionData((prev) => ({ ...prev, websiteUrl }));
    setCurrentStep(2);
  };

  const handleStepTwo = (platform: "IOS" | "ANDROID" | "BOTH") => {
    setConversionData((prev) => ({ ...prev, platform }));
    setCurrentStep(3);
  };

  const handleStepThree = (appData: {
    appName: string;
    primaryColor: string;
    secondaryColor?: string;
  }) => {
    setConversionData((prev) => ({ ...prev, ...appData }));
    setCurrentStep(4);
  };

  const handleStepFour = () => {
    setCurrentStep(5);
  };

  const handleStepFive = (plan: "BASIC" | "PRO" | "ENTERPRISE") => {
    setConversionData((prev) => ({ ...prev, plan }));
    setCurrentStep(6);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as ConversionStep);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Convert Your Website to Mobile App
          </h1>
          <p className="text-xl text-gray-600">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8 p-6 border-0 shadow-sm">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Progress</span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex gap-2 mt-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i + 1}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i + 1 <= currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Step Content */}
        <Card className="border-0 shadow-lg p-8 md:p-12">
          {currentStep === 1 && (
            <StepOne onNext={handleStepOne} isLoading={isLoading} />
          )}
          {currentStep === 2 && (
            <StepTwo onNext={handleStepTwo} onBack={handleBack} />
          )}
          {currentStep === 3 && (
            <StepThree onNext={handleStepThree} onBack={handleBack} />
          )}
          {currentStep === 4 && conversionData.appName && (
            <StepFour
              appData={{
                appName: conversionData.appName,
                websiteUrl: conversionData.websiteUrl || "",
                platform: conversionData.platform || "BOTH",
                primaryColor: conversionData.primaryColor || "#00A86B",
                secondaryColor: conversionData.secondaryColor,
              }}
              onNext={handleStepFour}
              onBack={handleBack}
            />
          )}
          {currentStep === 5 && (
            <StepFive onNext={handleStepFive} onBack={handleBack} />
          )}
          {currentStep >= 6 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Processing Your App
              </h2>
              <p className="text-gray-600">
                We're converting your website to a mobile app. This may take a few minutes...
              </p>
            </div>
          )}
        </Card>

        {/* Step Indicators */}
        <div className="mt-12 grid grid-cols-4 md:grid-cols-8 gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1;
            const stepLabels = [
              "URL",
              "Platform",
              "Design",
              "Preview",
              "Plan",
              "Checkout",
              "Process",
              "Download",
            ];

            return (
              <div key={stepNum} className="text-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold text-sm transition-colors ${
                    stepNum <= currentStep
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNum}
                </div>
                <p className="text-xs text-gray-600 hidden md:block">
                  {stepLabels[i]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
