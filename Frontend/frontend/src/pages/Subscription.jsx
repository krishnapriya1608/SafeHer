import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ShieldCheck, ArrowRight, Lock, Sparkles,ArrowLeft } from "lucide-react";
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
  "AI Safety Assistant (10 msgs/day)",
  "Fake call & community reports",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited trusted contacts",
  "AI Safety Assistant (Unlimited)",
  "Priority alert routing to nearby volunteers",
  "Full chat & incident history logs",
  "Automated scheduled safety check-ins",
];

export default function Subscription() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);

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
     console.log("Order object:", order);
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SafeSphere",
        description: "Pro Plan — Subscription",
        order_id: order.orderId,
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        theme: { color: "#B57C5D" },
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setStatus(result);
            
            // Redirect to Dashboard upon successful payment verification
            navigate("user/dashboard", { replace: true });
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
    <div className="bg-white min-h-screen text-[#5A4538] font-sans overflow-x-hidden selection:bg-[#B57C5D] selection:text-white">
      {/* Dynamic Font Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Montserrat:wght@300;400;500;600;700&display=swap');
        .font-script { font-family: 'Alex Brush', cursive; }
        .font-sans-clean { font-family: 'Montserrat', sans-serif; }
      `}</style>

      {/* Top Banner / Hero Section (Terracotta Wave) */}
      <section className="relative bg-[#B57C5D] pt-12 pb-24 px-6 sm:px-12 text-[#FAF5F0]">
         <Link
          to="/dashboard/user"
          className="inline-flex items-center gap-1.5 text-xs font-sans-clean font-semibold uppercase tracking-widest text-[#10010a] hover:text-[#7D5E71] transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to Safety Dashboard
        </Link>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          <div className="max-w-md text-left">
            <span className="font-script text-4xl sm:text-5xl text-[#F5ECE5] block mb-2">
              SafeSphere Plans
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-widest uppercase text-white leading-tight">
              CHOOSE THE PLAN THAT KEEPS YOU COVERED
            </h1>
            <p className="text-xs sm:text-sm text-[#F0DFD5] mt-4 font-sans-clean font-light leading-relaxed">
              Elevate your safety with round-the-clock protection, automated emergency tools, and unlimited priority support.
            </p>

            {/* Active Membership Banner */}
            {isPro && status?.planExpiry && (
              <div className="mt-6 inline-flex items-center gap-2 text-xs text-[#FAF5F0] bg-[#8C5E47] border border-[#D69F7E] rounded-full px-4 py-2 font-sans-clean">
                <ShieldCheck size={16} className="text-[#E0A96D]" />
                <span>You're on <strong>Pro Plan</strong> — Active until {new Date(status.planExpiry).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Arched Frame Element */}
          <div className="relative shrink-0">
            <div className="w-48 h-64 sm:w-52 sm:h-72 bg-[#CBB09C] rounded-t-[100px] border-4 border-white/20 overflow-hidden shadow-2xl flex items-center justify-center p-4 text-center">
              <div className="border border-white/40 w-full h-full rounded-t-[90px] flex flex-col items-center justify-center p-4">
                <Sparkles size={28} className="text-white mb-2" />
                <span className="font-script text-3xl text-white">Protection</span>
                <span className="text-[10px] uppercase tracking-widest text-[#F0DFD5] mt-1 font-sans-clean font-semibold">
                  Always On
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Section Curved Wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-0 pointer-events-none">
          <svg className="relative block w-full h-12 sm:h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,90 800,120 1200,40 L1200,120 L0,120 Z" fill="#FFFFFF"></path>
          </svg>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 font-sans-clean">
        
        {/* Billing Switcher & Swatch Accent Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 pb-6 border-b border-[#EAE0D5]">
          
          {/* Decorative Swatches */}
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-[#B57C5D]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#D69F7E]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#E0A96D]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#8C5E47]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#5A3E31]" />
          </div>

          {/* Billing Switcher Toggle */}
          <div className="inline-flex items-center gap-2 bg-[#FAF5F0] p-1.5 rounded-full border border-[#EAE0D5]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                !isAnnual ? "bg-[#B57C5D] text-white shadow-sm" : "text-[#8C624C] hover:text-[#5A4538]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isAnnual ? "bg-[#B57C5D] text-white shadow-sm" : "text-[#8C624C] hover:text-[#5A4538]"
              }`}
            >
              Annual
              <span className="text-[9px] bg-[#E0A96D] text-white px-2 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Free Plan Card */}
          <div className="border border-[#EAE0D5] bg-[#FAF5F0] rounded-3xl p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold uppercase tracking-widest text-[#5A4538]">Free</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#EAE0D5] text-[#8C624C] px-3 py-1 rounded-full">
                  Standard
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-3">
                <span className="text-4xl font-bold text-[#423127]">₹0</span>
                <span className="text-xs text-[#8C624C] font-medium">/ forever</span>
              </div>
              <p className="text-xs text-[#7A6050] mb-6">
                Essential emergency features to ensure basic daily protection.
              </p>

              <hr className="border-[#EAE0D5] mb-6" />

              <ul className="space-y-3.5 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-xs text-[#5A4538] font-medium">
                    <div className="p-0.5 rounded-full bg-[#EAE0D5] text-[#8C624C] mt-0.5 shrink-0">
                      <Check size={12} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled
              className="w-full py-3 rounded-full bg-[#EAE0D5] text-[#8C624C] text-xs uppercase font-bold tracking-widest cursor-not-allowed border border-[#D8C7B9]"
            >
              {isPro ? "Included in Plan" : "Current Plan"}
            </button>
          </div>

          {/* Pro Plan Card */}
          <div className="relative border-2 border-[#B57C5D] bg-white rounded-3xl p-8 flex flex-col justify-between shadow-xl">
            
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#B57C5D] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
              Recommended Choice
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <h2 className="text-xl font-bold uppercase tracking-widest text-[#5A4538]">Pro</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#F3D7C6] text-[#A2522C] px-3 py-1 rounded-full">
                  Full Suite
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-3">
                <span className="text-4xl font-bold text-[#B57C5D]">
                  ₹{isAnnual ? "79" : "99"}
                </span>
                <span className="text-xs text-[#8C624C] font-medium">/ month</span>
              </div>
              <p className="text-xs text-[#7A6050] mb-6">
                {isAnnual ? "Billed annually (₹948/yr)" : "Billed monthly. Cancel anytime."}
              </p>

              <hr className="border-[#EAE0D5] mb-6" />

              <ul className="space-y-3.5 mb-8">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-xs text-[#5A4538] font-medium">
                    <div className="p-0.5 rounded-full bg-[#F3D7C6] text-[#A2522C] mt-0.5 shrink-0">
                      <Check size={12} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {isPro ? (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full py-3.5 rounded-full bg-[#FAF2ED] text-[#B57C5D] hover:bg-[#F3D7C6] border border-[#B57C5D] text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> Go to Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#B57C5D] hover:bg-[#9B6447] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Opening Checkout…"
                ) : (
                  <>
                    Upgrade to Pro <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-8 p-4 rounded-2xl bg-[#E6C2C2]/30 border border-[#E6C2C2] text-[#8B3A3A] text-xs font-semibold text-center max-w-md mx-auto">
            {error}
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-[#8C7667]">
          <div className="flex items-center gap-1.5">
            <Lock size={13} className="text-[#B57C5D]" />
            <span>Secured with 256-bit encryption.</span>
          </div>
          <span className="hidden sm:inline">·</span>
          <span>Processed by Razorpay. SafeSphere never stores payment details.</span>
        </div>
      </main>

      {/* Wave Footer Section */}
      <section className="relative bg-[#B57C5D] mt-20 pt-20 pb-16 px-6 text-center text-[#FAF5F0]">
        <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none pointer-events-none transform rotate-180">
          <svg className="relative block w-full h-12 sm:h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C300,90 800,120 1200,40 L1200,120 L0,120 Z" fill="#FFFFFF"></path>
          </svg>
        </div>

        <div className="max-w-xl mx-auto relative z-10 font-sans-clean">
          <span className="font-script text-4xl text-[#F5ECE5] block mb-1">Empowered Peace of Mind</span>
          <h2 className="text-base sm:text-lg font-bold tracking-widest uppercase text-white mb-3">
            YOUR SAFETY IS OUR PRIORITY
          </h2>
          <p className="text-xs text-[#F0DFD5] leading-relaxed font-light max-w-lg mx-auto">
            Enjoy full access to advanced tracking, priority emergency alerts, and unlimited AI assistant messages.
          </p>
        </div>
      </section>
    </div>
  );
}