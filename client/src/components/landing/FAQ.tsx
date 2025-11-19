import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "How long does the conversion take?",
      answer:
        "Most conversions complete in under 5 minutes. The exact time depends on your website's complexity and size. You'll receive a notification once your app is ready for download.",
    },
    {
      question: "Do I need coding knowledge?",
      answer:
        "No coding required! Our platform handles everything for you. Simply provide your website URL, customize the design, and we'll generate your mobile app automatically.",
    },
    {
      question: "Can I publish to App Store and Google Play?",
      answer:
        "Yes, we provide all necessary files and documentation to help you publish your app to both Apple App Store and Google Play Store. We also offer guidance on the submission process.",
    },
    {
      question: "What happens to my website updates?",
      answer:
        "Your app syncs automatically with your website. Any updates you make to your website will be reflected in your app without requiring a new build or submission.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes, try our Pro plan free for 14 days. No credit card required. You'll have full access to all features during the trial period.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept Stripe (all major credit cards), PayPal, Google Pay, Visa, and Mastercard. All payments are processed securely with industry-standard encryption.",
    },
    {
      question: "Can I customize the app design?",
      answer:
        "Absolutely! You can customize colors, branding, app name, icon, splash screen, and more. Our Pro and Enterprise plans offer advanced customization options.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, contact our support team for a full refund.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 lg:py-40 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Find answers to common questions about B1 AppBuilder
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-gray-200 last:border-b-0"
              >
                <AccordionTrigger className="text-left px-6 md:px-8 py-5 md:py-6 hover:bg-gray-50 transition-colors group">
                  <span className="text-lg md:text-base font-semibold text-gray-900 group-hover:text-[#00A86B] transition-colors">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 md:px-8 py-4 md:py-5 bg-gray-50 text-gray-600 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
