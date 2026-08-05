import React, { useEffect, useState, useCallback } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createOrder, verifyPayment, fetchSubscriptionStatus } from "../api/subscriptionApi";

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

const FREE_FEATURES = [
  "SOS button & live location sharing",
  "Up to 3 trusted contacts",
  "AI Safety Assistant — 10 messages/day",
  "Fake call & community reports",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited trusted contacts",
  "AI Safety Assistant — unlimited messages",
  "Priority alert routing to nearby volunteers",
  "Full chat & incident history",
];

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadStatus = useCallback(() => {
    if (!isAuthenticated) return;
    fetchSubscriptionStatus()
      .then(setStatus)
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      setError("Please log in to upgrade to Pro.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load Razorpay checkout. Check your connection and try again.");
      }

      const order = await createOrder();

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
        theme: { color: "#0f766e" }, // teal-700
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setStatus(result);
          } catch (err) {
            setError("Payment succeeded but verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Something went wrong starting checkout.");
    } finally {
      setLoading(false);
    }
  };

  const isPro = status?.plan === "pro" && status?.planExpiry && new Date(status.planExpiry) > new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-sans">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-teal-700 font-semibold mb-2">
          SafeSphere Plans
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Choose the plan that keeps you covered</h1>
        {isPro && status?.planExpiry && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5">
            <ShieldCheck size={16} />
            You're on Pro — renews/expires {new Date(status.planExpiry).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free plan */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-white">
          <h2 className="text-lg font-semibold text-slate-900">Free</h2>
          <p className="text-3xl font-bold mt-2 mb-1">₹0</p>
          <p className="text-xs text-slate-500 mb-5">Forever free</p>
          <ul className="space-y-2.5">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                <Check size={16} className="text-slate-400 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Pro plan */}
        <div className="border-2 border-teal-700 rounded-2xl p-6 bg-teal-50/40 relative">
          <span className="absolute -top-3 left-6 bg-teal-700 text-white text-[10px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full">
            Recommended
          </span>
          <h2 className="text-lg font-semibold text-slate-900">Pro</h2>
          <p className="text-3xl font-bold mt-2 mb-1">
            ₹99<span className="text-sm font-normal text-slate-500">/month</span>
          </p>
          <p className="text-xs text-slate-500 mb-5">Billed every 30 days</p>
          <ul className="space-y-2.5 mb-6">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                <Check size={16} className="text-teal-700 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <button
              type="button"
              disabled
              className="w-full py-2.5 rounded-full bg-teal-100 text-teal-800 text-sm font-semibold cursor-default"
            >
              Current Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-2.5 rounded-full bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition disabled:opacity-50"
            >
              {loading ? "Opening checkout…" : "Upgrade to Pro"}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 text-center mt-6">{error}</p>}

      <p className="text-[11px] text-slate-400 text-center mt-8">
        Payments processed securely by Razorpay. SafeSphere never stores your card details.
      </p>
    </div>
  );
}
