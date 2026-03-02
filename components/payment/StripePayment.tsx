"use client";

import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  clientSecret: string;
  orderId: string;
  onSuccess: (paymentIntentId: string) => void; 
  onError: (error: string) => void;
}

function StripePaymentForm({ clientSecret, orderId, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        onError(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
      onError("An unexpected error occurred");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[#5D5FEF] text-white py-3 rounded-xl font-semibold hover:bg-[#4B4DC9] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Processing Payment...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
}

interface StripePaymentProps {
  clientSecret: string;
  orderId: string;
  onPaymentSuccess: (paymentIntentId: string) => void; 
  onPaymentError: (error: string) => void;
}

export default function StripePayment({ clientSecret, orderId, onPaymentSuccess, onPaymentError }: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePaymentForm
        clientSecret={clientSecret}
        orderId={orderId}
        onSuccess={onPaymentSuccess}
        onError={onPaymentError}
      />
    </Elements>
  );
}