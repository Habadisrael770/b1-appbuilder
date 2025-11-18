import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface StepThreeProps {
  onNext: (appData: {
    appName: string;
    primaryColor: string;
    secondaryColor?: string;
  }) => void;
  onBack: () => void;
}

export function StepThree({ onNext, onBack }: StepThreeProps) {
  const [appName, setAppName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#00A86B");
  const [secondaryColor, setSecondaryColor] = useState("#008556");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");

    if (!appName.trim()) {
      setError("App name is required");
      return;
    }

    if (appName.length < 3) {
      setError("App name must be at least 3 characters");
      return;
    }

    onNext({
      appName: appName.trim(),
      primaryColor,
      secondaryColor,
    });
  };

  const colorPresets = [
    { name: "B1 Green", primary: "#00A86B", secondary: "#008556" },
    { name: "Ocean Blue", primary: "#0066CC", secondary: "#004499" },
    { name: "Sunset Orange", primary: "#FF6B35", secondary: "#D94520" },
    { name: "Purple", primary: "#7C3AED", secondary: "#6D28D9" },
    { name: "Rose", primary: "#EC4899", secondary: "#BE185D" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 3: Customize Your App</h2>
        <p className="text-gray-600">
          Add your branding and choose your app colors
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto space-y-6">
        {/* App Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            App Name
          </label>
          <Input
            type="text"
            placeholder="My Awesome App"
            value={appName}
            onChange={(e) => {
              setAppName(e.target.value);
              setError("");
            }}
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">{appName.length}/50 characters</p>
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16 h-12 rounded cursor-pointer border border-gray-200"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#00A86B"
              className="flex-1"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Color (Optional)
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-16 h-12 rounded cursor-pointer border border-gray-200"
            />
            <Input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="#008556"
              className="flex-1"
            />
          </div>
        </div>

        {/* Color Presets */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Color Presets
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setPrimaryColor(preset.primary);
                  setSecondaryColor(preset.secondary);
                }}
                className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: preset.primary }}
                  ></div>
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: preset.secondary }}
                  ></div>
                </div>
                <p className="text-xs font-medium text-gray-700">{preset.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-lg text-white text-center font-semibold"
              style={{ backgroundColor: primaryColor }}>
              {appName || "App Name"}
            </div>
            <div className="flex-1 p-4 rounded-lg text-white text-center font-semibold"
              style={{ backgroundColor: secondaryColor }}>
              Secondary
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center max-w-2xl mx-auto pt-8">
        <Button
          onClick={onBack}
          variant="outline"
          className="px-8 py-3 font-semibold"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
