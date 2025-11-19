import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepSevenProps {
  onNext: () => void;
}

export function StepSeven({ onNext }: StepSevenProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"processing" | "completed" | "error">("processing");
  const [message, setMessage] = useState("Initializing conversion...");

  useEffect(() => {
    const messages = [
      "Initializing conversion...",
      "Analyzing website structure...",
      "Extracting content and assets...",
      "Generating app configuration...",
      "Building iOS package...",
      "Building Android package...",
      "Optimizing for mobile...",
      "Finalizing your app...",
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 12;
        if (newProgress >= 95) {
          clearInterval(interval);
          setStatus("completed");
          setMessage("Your app is ready!");
          // Auto-advance after 2 seconds
          setTimeout(() => {
            onNext();
          }, 2000);
          return 100;
        }
        const messageIndex = Math.floor((newProgress / 100) * messages.length);
        setMessage(messages[Math.min(messageIndex, messages.length - 1)]);
        return newProgress;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [onNext]);

  return (
    <div className="space-y-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {status === "completed" ? "Conversion Complete!" : "Processing Your App"}
        </h2>
        <p className="text-gray-600">
          {status === "completed"
            ? "Your mobile app has been successfully created"
            : "We're converting your website to a mobile app. This may take a few minutes..."}
        </p>
      </div>

      {/* Progress Visualization */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Circular Progress */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#00A86B"
                strokeWidth="8"
                strokeDasharray={`${(progress / 100) * 339.3} 339.3`}
                strokeLinecap="round"
                style={{ transition: "stroke-dasharray 0.3s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{Math.round(progress)}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center">
          {status === "processing" ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#00A86B] rounded-full animate-pulse"></div>
              <p className="text-gray-600 font-medium">{message}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#00A86B]" />
              <p className="text-gray-600 font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Step Progress */}
        <div className="space-y-2">
          {[
            "Website Analysis",
            "Content Extraction",
            "App Configuration",
            "iOS Build",
            "Android Build",
            "Optimization",
            "Finalization",
            "Packaging",
          ].map((step, index) => {
            const stepProgress = (index / 8) * 100;
            const isCompleted = progress >= stepProgress;
            const isActive = progress >= stepProgress && progress < (index + 1 / 8) * 100;

            return (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isCompleted
                      ? "bg-[#00A86B] text-white"
                      : isActive
                        ? "bg-[#00C47D] text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                <span
                  className={`text-sm ${
                    isCompleted ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Auto-advance message */}
        {status === "completed" && (
          <div className="text-center text-sm text-gray-500">
            Redirecting to download page in a moment...
          </div>
        )}
      </div>
    </div>
  );
}
