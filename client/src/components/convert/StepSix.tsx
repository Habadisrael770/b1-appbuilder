import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreditCard, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";

interface StepSixProps {
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  onNext: () => void;
  onBack: () => void;
}

export function StepSix({ plan, onBack, onNext }: StepSixProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "skip">("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardholderName: "",
  });

  const planPrices = {
    BASIC: 29,
    PRO: 99,
    ENTERPRISE: 299,
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onNext();
    }, 2000);
  };

  const handleSkipPayment = () => {
    setIsProcessing(true);
    // Simulate skipping payment
    setTimeout(() => {
      setIsProcessing(false);
      onNext();
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {paymentMethod === "skip" ? "Enjoy Your Free Trial" : "Complete Your Purchase"}
        </h2>
        <p className="text-gray-600">
          {paymentMethod === "skip"
            ? "You have 14 days free. Add payment method anytime."
            : "Secure payment processing with Stripe"}
        </p>
      </div>

      {/* Free Trial Banner */}
      <Card className="border-l-4 border-l-[#00A86B] bg-green-50 p-6 shadow-sm">
        <div className="flex gap-4">
          <AlertCircle className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">14-Day Free Trial</h3>
            <p className="text-sm text-gray-700">
              Start your free trial today. No payment required for the first 14 days. After that, we'll charge your payment method for the {plan} plan.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <Card className="md:col-span-1 border-0 shadow-sm p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium text-gray-900">{plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Trial Period</span>
              <span className="font-medium text-[#00A86B]">14 Days Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">After Trial</span>
              <span className="font-medium text-gray-900">${planPrices[plan]}/month</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-semibold text-gray-900">Today's Charge</span>
              <span className="font-bold text-[#00A86B] text-lg">$0</span>
            </div>
          </div>
        </Card>

        {/* Payment Method Selection */}
        <div className="md:col-span-2 space-y-6">
          {/* Payment Method Toggle */}
          <div className="flex gap-4">
            <label className="flex items-center gap-3 flex-1 p-4 border-2 rounded-lg cursor-pointer transition-colors"
              style={{
                borderColor: paymentMethod === "skip" ? "#00A86B" : "#e5e7eb",
                backgroundColor: paymentMethod === "skip" ? "#f0fdf4" : "transparent"
              }}>
              <input
                type="radio"
                name="payment"
                value="skip"
                checked={paymentMethod === "skip"}
                onChange={(e) => setPaymentMethod(e.target.value as "skip")}
                className="w-4 h-4"
              />
              <div>
                <p className="font-semibold text-gray-900">Skip for Now</p>
                <p className="text-sm text-gray-600">Start free trial without payment</p>
              </div>
            </label>

            <label className="flex items-center gap-3 flex-1 p-4 border-2 rounded-lg cursor-pointer transition-colors"
              style={{
                borderColor: paymentMethod === "card" ? "#00A86B" : "#e5e7eb",
                backgroundColor: paymentMethod === "card" ? "#f0fdf4" : "transparent"
              }}>
              <input
                type="radio"
                name="payment"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => setPaymentMethod(e.target.value as "card")}
                className="w-4 h-4"
              />
              <div>
                <p className="font-semibold text-gray-900">Add Payment Method</p>
                <p className="text-sm text-gray-600">Secure your subscription now</p>
              </div>
            </label>
          </div>

          {/* Payment Form - Only show if user selects "Add Payment Method" */}
          {paymentMethod === "card" && (
            <form onSubmit={handlePayment} className="space-y-6">
              <Card className="border-0 shadow-sm p-6">
                <div className="space-y-4">
                  {/* Cardholder Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={cardData.cardholderName}
                      onChange={(e) =>
                        setCardData({ ...cardData, cardholderName: e.target.value })
                      }
                      required
                      className="h-10"
                    />
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          if (value.length <= 16) {
                            const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
                            setCardData({ ...cardData, cardNumber: formatted });
                          }
                        }}
                        required
                        className="h-10 pl-10"
                      />
                      <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={cardData.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + "/" + value.slice(2, 4);
                          }
                          if (value.length <= 5) {
                            setCardData({ ...cardData, expiryDate: value });
                          }
                        }}
                        required
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <Input
                        type="text"
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 3) {
                            setCardData({ ...cardData, cvc: value });
                          }
                        }}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <Lock className="w-4 h-4 text-blue-600" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#00A86B] hover:bg-[#008556] text-white font-semibold"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay $${planPrices[plan]}`}
                </Button>
              </div>
            </form>
          )}

          {/* Skip Payment Buttons */}
          {paymentMethod === "skip" && (
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSkipPayment}
                className="flex-1 bg-[#00A86B] hover:bg-[#008556] text-white font-semibold"
                disabled={isProcessing}
              >
                {isProcessing ? "Starting Trial..." : "Start Free Trial"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
