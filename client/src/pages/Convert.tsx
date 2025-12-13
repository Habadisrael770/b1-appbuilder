import { useState } from "react";
import { StepOne } from "@/components/convert/StepOne";
import { StepTwo } from "@/components/convert/StepTwo";
import { StepThree } from "@/components/convert/StepThree";
import { StepFour } from "@/components/convert/StepFour";
import { StepFive } from "@/components/convert/StepFive";
import { StepSix } from "@/components/convert/StepSix";
import { StepSeven } from "@/components/convert/StepSeven";
import { StepEightEnhanced } from "@/components/convert/StepEightEnhanced";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

export default function Convert() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [conversionData, setConversionData] = useState<any>({});
  const [buildIds, setBuildIds] = useState<{ appId?: string; jobId?: string }>({});
  const createAppMutation = trpc.apps.create.useMutation();
  const startBuildMutation = trpc.builds.startBuild.useMutation();
  const progress = (currentStep / 8) * 100;

  const handleNext = (data: any) => { setConversionData((prev: any) => ({ ...prev, ...data })); setCurrentStep(s => s + 1); };
  const handleStepSeven = async () => {
    try {
      setIsLoading(true);
      const appResult = await createAppMutation.mutateAsync({
        appName: conversionData.appName!, websiteUrl: conversionData.websiteUrl!,
        platform: conversionData.platform || "BOTH", primaryColor: conversionData.primaryColor || "#00A86B",
        secondaryColor: conversionData.secondaryColor
      });
      if (!appResult.id) throw new Error("App creation failed");
      const newAppId = appResult.id.toString();
      const buildResult = await startBuildMutation.mutateAsync({ appId: newAppId, platform: conversionData.platform || "BOTH" });
      setBuildIds({ appId: newAppId, jobId: buildResult.jobId });
      setCurrentStep(8);
    } catch (error) { console.error("Conversion failed:", error); alert("Failed to start."); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4"><div className="max-w-4xl mx-auto">
        <Card className="mb-8 p-6 shadow-sm"><Progress value={progress} className="h-2" /></Card>
        <Card className="shadow-lg p-8">
          {currentStep === 1 && <StepOne onNext={(u) => handleNext({ websiteUrl: u })} isLoading={isLoading} />}
          {currentStep === 2 && <StepTwo onNext={(p) => handleNext({ platform: p })} onBack={() => setCurrentStep(1)} />}
          {currentStep === 3 && <StepThree onNext={handleNext} onBack={() => setCurrentStep(2)} />}
          {currentStep === 4 && <StepFour appData={conversionData} onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} />}
          {currentStep === 5 && <StepFive onNext={(p) => handleNext({ plan: p })} onBack={() => setCurrentStep(4)} />}
          {currentStep === 6 && <StepSix plan={conversionData.plan} onNext={() => setCurrentStep(7)} onBack={() => setCurrentStep(5)} />}
          {currentStep === 7 && <StepSeven onNext={handleStepSeven} />}
          {currentStep === 8 && buildIds.appId && <StepEightEnhanced appId={buildIds.appId} appName={conversionData.appName} platform={conversionData.platform} jobId={buildIds.jobId!} />}
        </Card>
      </div></div>
  );
}