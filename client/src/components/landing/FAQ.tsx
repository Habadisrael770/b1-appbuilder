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
        "Yes, try our Basic plan free for 14 days. No credit card required. You'll have full access to all features during the trial period.",
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
    <section id="faq" className="py-20 md:py-32 bg-gray-50">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about B1 AppBuilder
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
