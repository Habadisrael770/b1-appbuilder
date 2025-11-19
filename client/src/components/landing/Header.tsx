import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        isScrolled
          ? "border-b border-gray-200 shadow-md backdrop-blur-md bg-white/95"
          : "border-b border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-16">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-[#00A86B] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">B1</span>
          </div>
          <span className="font-bold text-lg text-[#00A86B] hidden sm:inline">
            {APP_TITLE}
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="text-gray-700 hover:text-[#00A86B] transition-colors font-medium text-base"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated && <NotificationCenter />}
          {isAuthenticated ? (
            <Button
              className="bg-[#00A86B] hover:bg-[#008556] text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <button
                onClick={() => (window.location.href = getLoginUrl())}
                className="text-gray-700 hover:text-[#00A86B] transition-colors font-medium text-base"
              >
                Sign In
              </button>
              <Button
                className="bg-[#00A86B] hover:bg-[#008556] text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-900" />
          ) : (
            <Menu className="w-6 h-6 text-gray-900" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 animate-in slide-in-from-right">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-gray-700 hover:text-[#00A86B] hover:bg-gray-50 transition-colors font-medium text-base px-4 py-3 rounded-lg text-left"
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-gray-200 pt-4 mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <Button
                  className="bg-[#00A86B] hover:bg-[#008556] text-white font-semibold w-full py-3 rounded-lg transition-all duration-200"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.location.href = getLoginUrl();
                    }}
                    className="text-gray-700 hover:text-[#00A86B] hover:bg-gray-50 transition-colors font-medium text-base px-4 py-3 rounded-lg text-left"
                  >
                    Sign In
                  </button>
                  <Button
                    className="bg-[#00A86B] hover:bg-[#008556] text-white font-semibold w-full py-3 rounded-lg transition-all duration-200"
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.location.href = getLoginUrl();
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
