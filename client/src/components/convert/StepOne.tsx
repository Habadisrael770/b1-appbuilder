import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, AlertCircle } from "lucide-react";
import { useState } from "react";

interface StepOneProps {
  onNext: (websiteUrl: string) => void;
  isLoading?: boolean;
}

export function StepOne({ onNext, isLoading = false }: StepOneProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateAndSubmit = async () => {
    setError("");

    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    try {
      // Validate URL format
      const urlToValidate = url.startsWith("http") ? url : `https://${url}`;
      new URL(urlToValidate);

      // TODO: Fetch website metadata and screenshot
      onNext(urlToValidate);
    } catch {
      setError("Please enter a valid website URL (e.g., example.com or https://example.com)");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      validateAndSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 1: Enter Your Website URL</h2>
        <p className="text-gray-600">
          Paste your website URL and let us analyze it to create your mobile app
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <Input
              type="text"
              placeholder="https://yourwebsite.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="text-base"
            />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={validateAndSubmit}
            disabled={isLoading || !url.trim()}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? "Analyzing..." : "Continue"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-primary-50 border border-primary-100 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>What happens next:</strong> We'll analyze your website, capture a screenshot, and extract metadata to create your mobile app. This usually takes less than a minute.
          </p>
        </div>
      </div>
    </div>
  );
}
