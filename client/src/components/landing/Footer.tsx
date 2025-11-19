import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
      { label: "How It Works", href: "#how-it-works" },
    ],
    support: [
      { label: "Contact Us", href: "#contact" },
      { label: "Help Center", href: "#" },
      { label: "Documentation", href: "#" },
      { label: "API Docs", href: "#" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 max-w-7xl py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-5 gap-12 md:gap-8 mb-12 md:mb-16">
          {/* Company Column */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#00A86B] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">B1</span>
              </div>
              <span className="font-bold text-white text-lg">B1 AppBuilder</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Convert your website to a mobile app in minutes
            </p>
            <p className="text-xs text-gray-500">
              © {currentYear} B1 AppBuilder. All rights reserved.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-base">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#00A86B] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-base">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#00A86B] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-base">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#00A86B] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Column */}
          <div>
            <h4 className="font-semibold text-white mb-6 text-base">Follow Us</h4>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#00A86B] transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800"></div>

        {/* Bottom Footer */}
        <div className="pt-8 md:pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-500">
            Made with 💚 by B1 AppBuilder Team
          </p>
          <div className="flex gap-8">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-[#00A86B] transition-colors duration-200"
            >
              Status
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-[#00A86B] transition-colors duration-200"
            >
              Blog
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-[#00A86B] transition-colors duration-200"
            >
              Changelog
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
