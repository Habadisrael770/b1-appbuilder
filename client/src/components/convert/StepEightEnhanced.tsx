/**
 * StepEight Enhanced - Download & Build Status with Error Handling
 * Shows build progress, errors, and download options
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2, ArrowRight, FileText, Lock, AlertCircle, Loader, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface StepEightEnhancedProps {
  appId?: string;
  appName?: string;
  platform?: "IOS" | "ANDROID" | "BOTH";
  buildId?: string;
  resultUrl?: string;
  onComplete?: () => void;
}

type BuildStatus = "PENDING" | "BUILDING" | "COMPLETED" | "FAILED";

interface BuildState {
  status: BuildStatus;
  progress: number;
  androidUrl?: string;
  iosUrl?: string;
  error?: string;
}

export function StepEightEnhanced({ appId, appName, platform, buildId, resultUrl, onComplete }: StepEightEnhancedProps) {
  const [, setLocation] = useLocation();
  const [buildState, setBuildState] = useState<BuildState>({
    status: "BUILDING",
    progress: 0
  });
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "downloading">("idle");
  const [showAppDetails, setShowAppDetails] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  // Poll build status
  const { data: statusData, isLoading: isStatusLoading } = trpc.builds.getBuildStatus.useQuery(
    { buildId: buildId || "" },
    {
      refetchInterval: buildState.status === "BUILDING" ? 3000 : false,
      enabled: buildState.status === "BUILDING"
    }
  );

  // Update build state when status changes
  useEffect(() => {
    if (statusData) {
      setBuildState({
        status: statusData.status as BuildStatus,
        progress: statusData.progress,
        androidUrl: statusData.androidUrl ?? undefined,
        iosUrl: statusData.iosUrl ?? undefined,
        error: statusData.error ?? undefined
      });
    }
  }, [statusData]);

  const handleDownload = async (type: "ios" | "android") => {
    setDownloadStatus("downloading");
    try {
      const downloadUrl = type === "ios" ? buildState.iosUrl : buildState.androidUrl;
      
      if (!downloadUrl) {
        throw new Error(`${type.toUpperCase()} build not available`);
      }

      // Open download in new tab
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Download error:", error);
      alert(`Failed to download ${type.toUpperCase()} app. Please try again.`);
    } finally {
      setDownloadStatus("idle");
    }
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

  // Render based on build status
  if (buildState.status === "BUILDING") {
    return (
      <div className="space-y-8 py-8">
        {/* Building Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center animate-spin">
              <Loader className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">Building Your App</h2>
          <p className="text-xl text-gray-600">
            We're generating your {platform} app. This usually takes 5-10 minutes.
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="border-0 shadow-sm p-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Build Progress</span>
              <span className="text-sm font-medium text-gray-600">{buildState.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${buildState.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {buildState.progress < 25 && "Preparing build environment..."}
              {buildState.progress >= 25 && buildState.progress < 50 && "Compiling source code..."}
              {buildState.progress >= 50 && buildState.progress < 75 && "Generating packages..."}
              {buildState.progress >= 75 && buildState.progress < 100 && "Finalizing build..."}
              {buildState.progress === 100 && "Build complete! Preparing download..."}
            </p>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="border-0 shadow-sm p-6 bg-blue-50 max-w-2xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Please Wait
          </h3>
          <p className="text-sm text-gray-600">
            Don't close this page. Your app is being built in the background. You'll be notified when it's ready to download.
          </p>
        </Card>
      </div>
    );
  }

  if (buildState.status === "FAILED") {
    return (
      <div className="space-y-8 py-8">
        {/* Error Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">Build Failed</h2>
          <p className="text-xl text-gray-600">
            Unfortunately, we couldn't build your app. Please check the error details below.
          </p>
        </div>

        {/* Error Details */}
        <Card className="border-0 shadow-sm p-6 max-w-2xl mx-auto border-l-4 border-red-600">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Error Details
            </h3>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm font-mono text-red-800">
                {buildState.error || "An unknown error occurred"}
              </p>
            </div>
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showErrorDetails ? "Hide" : "Show"} Technical Details
            </button>
            {showErrorDetails && (
              <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono text-gray-700 max-h-48 overflow-y-auto">
                <pre>{buildState.error}</pre>
              </div>
            )}
          </div>
        </Card>

        {/* Common Solutions */}
        <Card className="border-0 shadow-sm p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-gray-900 mb-4">Common Solutions</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Check your website URL</p>
                <p className="text-sm text-gray-600">Make sure the URL is accessible and doesn't require login</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Verify app name and settings</p>
                <p className="text-sm text-gray-600">Go back and check that all settings are correct</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Contact support</p>
                <p className="text-sm text-gray-600">Email support@b1appbuilder.com with your app ID</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <Button
            onClick={() => setLocation("/convert")}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12"
          >
            Try Again
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={handleGoToDashboard}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-50 h-12"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Success state
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
                disabled={downloadStatus === "downloading" || !buildState.iosUrl}
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
                disabled={downloadStatus === "downloading" || !buildState.androidUrl}
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
                    com.b1appbuilder.{(appName || "app").replace(/\s+/g, "").toLowerCase()}
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
                <p>✓ Privacy Policy included in app</p>
                <p>✓ Terms of Service available</p>
                <p>✓ GDPR compliant</p>
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
