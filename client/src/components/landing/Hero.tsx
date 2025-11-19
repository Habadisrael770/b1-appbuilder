import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Zap, Globe, Smartphone } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export function Hero() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      setLocation(`/convert?url=${encodeURIComponent(url)}`);
    } catch {
      setError("Please enter a valid website URL");
    }
  };

  return (
    <section id="home" className="relative py-20 lg:py-32 bg-gradient-to-b from-white to-[#E8F5E9]">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Convert Your Website to 
                <span className="text-[#00A86B]"> Mobile App </span>
                in Minutes
              </h1>
              <p className="text-xl text-gray-600">
                No coding required. Launch your iOS and Android app in 3 simple steps.
              </p>
            </div>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <Input
                type="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                className="flex-1 h-12 text-lg"
                required
              />
              <Button 
                type="submit"
                className="h-12 px-8 bg-[#00A86B] hover:bg-[#008556] text-white font-semibold transition-colors whitespace-nowrap"
              >
                Start Conversion
              </Button>
            </form>

            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#00A86B]" />
                <span className="text-gray-700 font-medium">No Code Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00A86B]" />
                <span className="text-gray-700 font-medium">Fast Deployment</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00A86B]" />
                <span className="text-gray-700 font-medium">Cross-Platform</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white" />
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">10,000+</span> businesses trust us
              </p>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative mx-auto w-full max-w-md">
              {/* Phone Frame */}
              <div className="relative">
                <div className="relative mx-auto w-64 h-96">
                  {/* iPhone Mockup */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>
                    
                    {/* Screen Content */}
                    <div className="w-full h-full bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] flex flex-col items-center justify-center p-6 pt-10">
                      <div className="w-12 h-12 bg-[#00A86B] rounded-2xl mb-4 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">B1</span>
                      </div>
                      <p className="text-center text-gray-700 font-semibold text-sm">
                        Your App Here
                      </p>
                      <p className="text-center text-gray-600 text-xs mt-2">
                        Built in minutes
                      </p>
                    </div>
                  </div>

                  {/* Shadow */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-black/20 rounded-full blur-lg"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 animate-bounce">
                  <Smartphone className="w-6 h-6 text-[#00A86B]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
