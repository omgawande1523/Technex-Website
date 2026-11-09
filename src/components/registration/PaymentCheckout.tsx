
"use client";

import { useState } from "react";
import {
  createPaymentOrder,
  type RazorpayPaymentResponse,
} from "@/lib/api";

type PaymentCheckoutProps = {
  registrationCode: string;
  onPaymentResponse: (response: RazorpayPaymentResponse) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  theme?: {
    color: string;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (
    event: string,
    callback: (response: unknown) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayOptions,
    ) => RazorpayInstance;
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default function PaymentCheckout({
  registrationCode,
  onPaymentResponse,
}: PaymentCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      // The backend determines the actual amount and creates the order.
      const order = await createPaymentOrder(registrationCode);

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "TECHNEX 2026",
        description: "Event Registration",
        order_id: order.orderId,

        handler: (response) => {
          // Pass the response for backend verification.
          // Do not treat this callback as payment confirmation.
          setLoading(false);
          onPaymentResponse(response);
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        theme: {
          color: "#D4AF37",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", () => {
        setError("Payment failed. You can try again.");
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to initiate payment.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="w-full rounded-xl bg-black px-6 py-3 font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Initiating Payment..." : "Pay Now"}
      </button>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
