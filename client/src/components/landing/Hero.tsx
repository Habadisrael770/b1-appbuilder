import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Zap, Globe, Smartphone, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function Hero() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <section
      id="home"
      className="relative py-20 md:py-32 lg:py-40 bg-gradient-to-b from-white to-[#E8F5E9] overflow-hidden"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:space-y-10">
            {/* Headline */}
            <div
              className={`space-y-6 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Convert Your Website to{" "}
                <span className="text-[#00A86B]">Mobile App</span> in Minutes
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
                No coding required. Launch your iOS and Android app in 3 simple
                steps.
              </p>
            </div>

            {/* URL Input Form */}
            <form
              onSubmit={handleSubmit}
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
                <Input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  className={`flex-1 h-14 px-5 text-base border-2 rounded-xl transition-all duration-200 ${
                    error
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-[#00A86B]"
                  }`}
                  required
                />
                <Button
                  type="submit"
                  className="h-14 px-8 bg-[#00A86B] hover:bg-[#008556] text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-98 whitespace-nowrap"
                >
                  Start Conversion
                </Button>
              </div>
              {error && (
                <p className="text-red-500 text-sm font-medium mt-3">
                  {error}
                </p>
              )}
            </form>

            {/* Trust Badges */}
            <div
              className={`flex flex-wrap gap-6 md:gap-8 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "0.3s" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Check className="w-5 h-5 text-[#00A86B]" />
                </div>
                <span className="text-gray-700 font-medium text-base">
                  No Code Required
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Zap className="w-5 h-5 text-[#00A86B]" />
                </div>
                <span className="text-gray-700 font-medium text-base">
                  Fast Deployment
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Globe className="w-5 h-5 text-[#00A86B]" />
                </div>
                <span className="text-gray-700 font-medium text-base">
                  Cross-Platform
                </span>
              </div>
            </div>

            {/* Social Proof */}
            <div
              className={`flex items-center gap-4 pt-4 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "0.4s" }}
            >
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex-shrink-0" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex-shrink-0" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white flex-shrink-0" />
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">10,000+</span>{" "}
                businesses trust us
              </p>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div
              className={`transition-all duration-700 ${
                isVisible
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90"
              }`}
              style={{ transitionDelay: "0.3s" }}
            >
              {/* Phone Frame */}
              <div className="relative mx-auto w-full max-w-sm">
                <div className="relative">
                  {/* iPhone Mockup */}
                  <div className="relative mx-auto w-72 h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-900">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>

                    {/* Screen Content */}
                    <div className="w-full h-full bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] flex flex-col items-center justify-center p-6 pt-12">
                      <div className="w-14 h-14 bg-[#00A86B] rounded-3xl mb-6 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">B1</span>
                      </div>
                      <p className="text-center text-gray-700 font-semibold text-base">
                        Your App Here
                      </p>
                      <p className="text-center text-gray-600 text-sm mt-3">
                        Built in minutes
                      </p>
                    </div>
                  </div>

                  {/* Drop Shadow */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-56 h-12 bg-black/20 rounded-full blur-2xl"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 animate-bounce">
                  <Smartphone className="w-8 h-8 text-[#00A86B]" />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-4 animate-pulse">
                  <Bell className="w-8 h-8 text-[#00A86B]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
