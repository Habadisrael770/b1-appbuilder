import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface StepThreeProps {
  onNext: (appData: {
    appName: string;
    primaryColor: string;
    secondaryColor?: string;
    appIcon?: File;
    splashScreen?: File;
    screenshots?: File[];
  }) => void;
  onBack: () => void;
}

export function StepThree({ onNext, onBack }: StepThreeProps) {
  const [appName, setAppName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#00A86B");
  const [secondaryColor, setSecondaryColor] = useState("#008556");
  const [error, setError] = useState("");
  
  // File uploads
  const [appIcon, setAppIcon] = useState<File | null>(null);
  const [appIconPreview, setAppIconPreview] = useState<string>("");
  const [splashScreen, setSplashScreen] = useState<File | null>(null);
  const [splashScreenPreview, setSplashScreenPreview] = useState<string>("");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const colorPresets = [
    { name: "B1 Green", primary: "#00A86B", secondary: "#008556" },
    { name: "Ocean Blue", primary: "#0066CC", secondary: "#004499" },
    { name: "Sunset Orange", primary: "#FF6B35", secondary: "#D94520" },
    { name: "Purple", primary: "#7C3AED", secondary: "#6D28D9" },
    { name: "Rose", primary: "#EC4899", secondary: "#BE185D" },
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "icon" | "splash" | "screenshots"
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (type === "icon") {
      const file = files[0];
      setAppIcon(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAppIconPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === "splash") {
      const file = files[0];
      setSplashScreen(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSplashScreenPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === "screenshots") {
      const newScreenshots = Array.from(files);
      setScreenshots((prev) => [...prev, ...newScreenshots].slice(0, 5)); // Max 5 screenshots

      // Generate previews
      const newPreviews: string[] = [];
      let loadedCount = 0;

      newScreenshots.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newPreviews.push(event.target?.result as string);
          loadedCount++;
          if (loadedCount === newScreenshots.length) {
            setScreenshotPreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

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
      appIcon: appIcon || undefined,
      splashScreen: splashScreen || undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Step 3: Customize Your App</h2>
        <p className="text-gray-600">
          Add your branding, colors, and app assets
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-4xl mx-auto space-y-8">
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

        {/* Colors Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">App Colors</h3>

          {/* Primary Color */}
          <div className="mb-6">
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
          <div className="mb-6">
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
          <div className="p-4 bg-gray-50 rounded-lg mt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
            <div className="flex gap-4">
              <div
                className="flex-1 p-4 rounded-lg text-white text-center font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                {appName || "App Name"}
              </div>
              <div
                className="flex-1 p-4 rounded-lg text-white text-center font-semibold"
                style={{ backgroundColor: secondaryColor }}
              >
                Secondary
              </div>
            </div>
          </div>
        </div>

        {/* App Assets Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">App Assets</h3>

          {/* App Icon */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              App Icon (PNG, JPG - 512x512px recommended)
            </label>
            <Card className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#00A86B] transition-colors">
              {appIconPreview ? (
                <div className="space-y-4">
                  <img
                    src={appIconPreview}
                    alt="App Icon Preview"
                    className="w-24 h-24 mx-auto rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appIcon?.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAppIcon(null);
                        setAppIconPreview("");
                      }}
                      className="text-xs text-red-600 hover:text-red-700 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "icon")}
                    className="hidden"
                  />
                </label>
              )}
            </Card>
          </div>

          {/* Splash Screen */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Splash Screen (PNG, JPG - 1080x1920px recommended)
            </label>
            <Card className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#00A86B] transition-colors">
              {splashScreenPreview ? (
                <div className="space-y-4">
                  <img
                    src={splashScreenPreview}
                    alt="Splash Screen Preview"
                    className="w-32 h-auto mx-auto rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{splashScreen?.name}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSplashScreen(null);
                        setSplashScreenPreview("");
                      }}
                      className="text-xs text-red-600 hover:text-red-700 mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "splash")}
                    className="hidden"
                  />
                </label>
              )}
            </Card>
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Screenshots (PNG, JPG - Up to 5 images, 1080x1920px recommended)
            </label>
            <Card className="border-2 border-dashed border-gray-300 p-6 text-center hover:border-[#00A86B] transition-colors mb-4">
              <label className="cursor-pointer space-y-2">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">Click to upload screenshots</p>
                <p className="text-xs text-gray-500">
                  {screenshotPreviews.length}/5 screenshots uploaded
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange(e, "screenshots")}
                  className="hidden"
                />
              </label>
            </Card>

            {/* Screenshot Previews */}
            {screenshotPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {screenshotPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
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
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#00A86B] hover:bg-[#008556] text-white font-semibold"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
