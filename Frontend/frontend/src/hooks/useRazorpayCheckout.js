import { useState } from "react";
import { createOrder, verifyPayment } from "../api/subscriptionApi";

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Usage: const { payNow, payLoading, payError } = useRazorpayCheckout({ user, onSuccess });
export function useRazorpayCheckout({ user, onSuccess } = {}) {
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState(null);

  const payNow = async () => {
    setPayError(null);
    setPayLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load the payment window. Check your connection and try again.");
      }

      const order = await createOrder();
      console.log("Order object:", order);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SafeSphere",
        description: "Pro Plan — 30 days",
        order_id: order.orderId,
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        theme: { color: "#0f766e" },
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onSuccess?.(result);
          } catch (err) {
            setPayError("Payment succeeded but verification failed. Please contact support.");
          } finally {
            setPayLoading(false);
          }
        },
        modal: {
          ondismiss: () => setPayLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setPayError("Payment failed. Please try again.");
        setPayLoading(false);
      });
      rzp.open();
    } catch (err) {
      setPayError(err.message || "Something went wrong starting checkout.");
      setPayLoading(false);
    }
  };

  return { payNow, payLoading, payError };
}