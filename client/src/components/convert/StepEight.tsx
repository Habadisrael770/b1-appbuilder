import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Share2, ArrowRight, FileText, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface StepEightProps {
  appName: string;
  platform: "IOS" | "ANDROID" | "BOTH";
}

export function StepEight({ appName, platform }: StepEightProps) {
  const [, setLocation] = useLocation();
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading">("idle");
  const [showAppDetails, setShowAppDetails] = useState(false);

  const handleDownload = (type: "ios" | "android" | "both") => {
    setDownloadStatus("downloading");
    
    // Simulate file generation and download
    setTimeout(() => {
      // Create a mock download
      const element = document.createElement("a");
      const file = new Blob(
        [`Mock ${type.toUpperCase()} App Package for ${appName}`],
        { type: "application/octet-stream" }
      );
      element.href = URL.createObjectURL(file);
      element.download = `${appName.replace(/\s+/g, "-").toLowerCase()}-${type}.${
        type === "ios" ? "ipa" : "apk"
      }`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setDownloadStatus("idle");
    }, 1500);
  };

  const handleGoToDashboard = () => {
    setLocation("/dashboard");
  };

  const appPermissions = [
    "Internet Access",
    "Camera",
    "Location Services",
    "Contacts",
    "Photo Library",
    "Microphone",
  ];

  return (
    <div className="space-y-8 py-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-12 h-12 text-[#00A86B]" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-gray-900">Congratulations!</h2>
        <p className="text-xl text-gray-600">
          Your mobile app "{appName}" is ready to download
        </p>
      </div>

      {/* Download Cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {(platform === "IOS" || platform === "BOTH") && (
          <Card className="border-0 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">iOS</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">iOS App</h3>
                  <p className="text-sm text-gray-500">iPhone & iPad</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Download your app for Apple devices. Ready to submit to App Store.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                <p>📦 Format: <strong>.ipa</strong></p>
                <p>📱 Min iOS: <strong>13.0+</strong></p>
              </div>
              <Button
                onClick={() => handleDownload("ios")}
                disabled={downloadStatus === "downloading"}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloadStatus === "downloading" ? "Downloading..." : "Download iOS"}
              </Button>
            </div>
          </Card>
        )}

        {(platform === "ANDROID" || platform === "BOTH") && (
          <Card className="border-0 shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#3DDC84] rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Android App</h3>
                  <p className="text-sm text-gray-500">Android Devices</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Download your app for Android devices. Ready to submit to Google Play.
              </p>
              <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
                <p>📦 Format: <strong>.apk</strong></p>
                <p>📱 Min Android: <strong>8.0+</strong></p>
              </div>
              <Button
                onClick={() => handleDownload("android")}
                disabled={downloadStatus === "downloading"}
                className="w-full bg-[#3DDC84] hover:bg-[#2BC76F] text-white font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloadStatus === "downloading" ? "Downloading..." : "Download Android"}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* App Details Section */}
      <Card className="border-0 shadow-sm p-6 max-w-2xl mx-auto">
        <button
          onClick={() => setShowAppDetails(!showAppDetails)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00A86B]" />
            App Details & Permissions
          </h3>
          <span className={`transform transition-transform ${showAppDetails ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>

        {showAppDetails && (
          <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
            {/* App Permissions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00A86B]" />
                App Permissions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {appPermissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-[#00A86B] rounded-full"></div>
                    {permission}
                  </div>
                ))}
              </div>
            </div>

            {/* App Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">App Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">App Name:</span>
                  <span className="font-medium text-gray-900">{appName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium text-gray-900">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bundle ID:</span>
                  <span className="font-medium text-gray-900 text-xs">
                    com.b1appbuilder.{appName.replace(/\s+/g, "").toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Privacy & Legal */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Privacy & Legal
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  ✓ Privacy Policy included in app
                </p>
                <p>
                  ✓ Terms of Service available
                </p>
                <p>
                  ✓ GDPR compliant
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* What's Next */}
      <Card className="border-0 shadow-sm p-6 bg-blue-50 max-w-2xl mx-auto">
        <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Download your app</p>
              <p className="text-sm text-gray-600">Get the iOS (.ipa) and/or Android (.apk) packages</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Test your app</p>
              <p className="text-sm text-gray-600">Install and test on your devices or simulator</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Submit to app stores</p>
              <p className="text-sm text-gray-600">Publish on App Store and Google Play Store</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-medium text-gray-900">Monitor and update</p>
              <p className="text-sm text-gray-600">Track analytics and push updates from your dashboard</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
        <Button
          onClick={handleGoToDashboard}
          className="flex-1 bg-[#00A86B] hover:bg-[#008556] text-white font-semibold h-12"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-[#00A86B] text-[#00A86B] hover:bg-[#E8F5E9] h-12"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>

      {/* Support */}
      <div className="text-center text-sm text-gray-600">
        <p>Need help? Contact our support team at support@b1appbuilder.com</p>
      </div>
    </div>
  );
}
