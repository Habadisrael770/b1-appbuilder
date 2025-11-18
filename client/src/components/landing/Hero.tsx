import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useState } from "react";

export function Hero() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateAndSubmit = () => {
    setError("");
    
    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      // TODO: Navigate to conversion flow
      console.log("Valid URL:", url);
    } catch {
      setError("Please enter a valid website URL");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      validateAndSubmit();
    }
  };

  const trustBadges = [
    { icon: "⚡", label: "No Code Required" },
    { icon: "🚀", label: "Fast Deployment" },
    { icon: "📱", label: "Cross-Platform" },
  ];

  return (
    <section id="home" className="py-20 md:py-32 bg-gradient-to-br from-white via-primary-50 to-white">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Convert Your Website to Mobile App in Minutes
              </h1>
              <p className="text-xl text-gray-600">
                No coding required. Launch on iOS & Android in 3 simple steps
              </p>
            </div>

            {/* URL Input */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-3 text-base"
                />
                <Button
                  onClick={validateAndSubmit}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 flex items-center gap-2 whitespace-nowrap"
                >
                  Start Conversion
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-64 h-96">
              {/* iPhone Mockup */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>
                
                {/* Screen Content */}
                <div className="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col items-center justify-center p-6 pt-10">
                  <div className="w-12 h-12 bg-primary rounded-2xl mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">B1</span>
                  </div>
                  <p className="text-center text-gray-700 font-semibold text-sm">
                    Your App Here
                  </p>
                  <p className="text-center text-gray-500 text-xs mt-2">
                    Built in minutes
                  </p>
                </div>
              </div>

              {/* Shadow */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-black/20 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
