/**
 * Install Landing Page
 * ====================
 * Beautiful, simple landing page for APK installation
 * 
 * Features:
 * - Big "Install Now" button
 * - QR Code for scanning from desktop
 * - Simple 3-step instructions
 * - Professional design
 */

import { useEffect, useState } from "react";
import { useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Smartphone, CheckCircle, Shield, QrCode } from "lucide-react";

// QR Code component using external API
function QRCode({ url, size = 200 }: { url: string; size?: number }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    <img 
      src={qrUrl} 
      alt="QR Code" 
      width={size} 
      height={size}
      className="rounded-lg shadow-md"
    />
  );
}

export default function InstallPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  // Get parameters from URL
  const appName = params.get("name") || "Nadav Market";
  const apkUrl = params.get("url") || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663159369914/BaJKAYTIuEnAdSzx.apk";
  const iconUrl = params.get("icon") || "";
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    
    // Create download link
    const link = document.createElement("a");
    link.href = apkUrl;
    link.download = `${appName.replace(/\s+/g, "-")}.apk`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadStarted(true);
    }, 1500);
  };

  // Current page URL for QR code
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          {iconUrl ? (
            <img src={iconUrl} alt={appName} className="w-16 h-16 rounded-2xl shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {appName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">{appName}</h1>
        <p className="text-gray-600 mt-2">התקן את האפליקציה בקלות</p>
      </header>

      {/* Main Content */}
      <main className="container max-w-lg mx-auto px-4 py-8">
        {/* Download Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center">
            <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <h2 className="text-xl font-semibold">מוכן להתקנה</h2>
            <p className="text-emerald-100 text-sm mt-1">גרסה 1.0.0 • 5.1 MB</p>
          </div>
          
          <CardContent className="p-6">
            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  מוריד...
                </>
              ) : downloadStarted ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  ההורדה התחילה!
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  התקן עכשיו
                </>
              )}
            </Button>

            {downloadStarted && (
              <p className="text-center text-sm text-emerald-600 mt-3 animate-pulse">
                בדוק את ההודעות בטלפון ולחץ על הקובץ להתקנה
              </p>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              איך להתקין?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">לחץ על "התקן עכשיו"</p>
                  <p className="text-sm text-gray-500">הקובץ יורד אוטומטית</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">פתח את ההודעה</p>
                  <p className="text-sm text-gray-500">לחץ על הקובץ שירד</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">אשר התקנה</p>
                  <p className="text-sm text-gray-500">לחץ "התקן" ובסיום "פתח"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                סרוק מהמחשב
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              סרוק את הקוד עם הטלפון כדי לפתוח את דף ההתקנה
            </p>
            <div className="flex justify-center">
              <QRCode url={apkUrl} size={180} />
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>אפליקציה בטוחה ומאומתת</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        <p>Powered by B1 AppBuilder</p>
      </footer>
    </div>
  );
}
