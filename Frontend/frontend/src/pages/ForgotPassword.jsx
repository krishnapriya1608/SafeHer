import { useState } from "react";
import { Link } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import bgImage from "../assets/forgotpsswd.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authApi.forgotPassword({ email });
      setMessage(response.data.message || "Password reset link sent");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send reset link");
    } finally {
      setLoading(false);
    }
  };

  const obj = {
    eyebrow: "Account Recovery",
    title: "Redefined Security.",
    subtitle: "Enter your registered email address to receive your password recovery link.",
  };

  return (
    <div className="min-h-screen bg-[#F7F2EE] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#3D322C] selection:bg-[#E5C9BC] selection:text-[#2A201B]">
      {/* Background Soft Texture Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#D8C4B8_1px,transparent_1px)] [background-size:28px_28px]" />

      <main className="max-w-4xl mx-auto relative z-10">
        
        {/* TOP HERO HEADER */}
        <header className="text-center mb-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#B58C79] font-semibold block">
            {obj.eyebrow}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#2C211B] tracking-wide font-normal leading-tight">
            {obj.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#827065] italic font-serif max-w-md mx-auto">
            {obj.subtitle}
          </p>
        </header>

        {/* ELEGANT COLLAGE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* LEFT: IMAGE DISPLAY WITH DOUBLE EMBEDDED FRAME */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#FAF7F4] p-4 shadow-2xl border border-[#ECE2DA]">
              {/* Image Frame */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#ECE2DA]">
                <img
                  src={bgImage}
                  alt="Account Recovery"
                  className="w-full h-full object-cover contrast-[98%] transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#D4A390]/10 mix-blend-multiply" />
              </div>

              {/* Decorative Caption */}
              <div className="mt-4 pt-4 border-t border-[#EFE5DC] text-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B58C79] font-semibold block mb-1">
                  Personal Support
                </span>
                <p className="text-xs font-serif italic text-[#6B5A50]">
                  "Effortless reset process tailored to protect your profile."
                </p>
              </div>
            </div>

            {/* Floating Gold Overlay Label */}
            <div className="hidden sm:block absolute -bottom-4 -left-4 bg-[#C8A882] text-[#FFFBF8] px-4 py-2 shadow-lg text-[10px] font-serif tracking-[0.2em] uppercase border border-[#B3926C]">
              Safety First
            </div>
          </div>

          {/* RIGHT: FORGOT PASSWORD FORM CARD */}
          <div className="lg:col-span-7 bg-[#FAF7F4] p-6 sm:p-10 shadow-2xl border border-[#ECE2DA] relative">
            
            <div className="mb-6 pb-4 border-b border-[#EFE5DC]">
              <h2 className="text-xl font-serif text-[#2C211B] tracking-wide uppercase font-medium">
                Reset Password
              </h2>
              <p className="text-xs text-[#827065] mt-1">
                We will email you direct instructions to regain access.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              
              {/* Status Alert Messages */}
              {message && <StatusMessage type="success">{message}</StatusMessage>}
              {error && <StatusMessage type="error">{error}</StatusMessage>}

              {/* EMAIL INPUT */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-[#6E5D52]">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-[#F5EFEA] border border-[#E0D4CA] px-4 py-3 text-sm text-[#2C211B] placeholder-[#B5A69B] transition-all duration-200 focus:outline-none focus:border-[#C8A882] focus:bg-white focus:ring-1 focus:ring-[#C8A882] disabled:opacity-50"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#B58C79] text-[#FFFBF8] py-3.5 px-6 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 hover:bg-[#9E7664] focus:outline-none focus:ring-2 focus:ring-[#B58C79] focus:ring-offset-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-[#FFFBF8]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending link...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>

              {/* BACK TO LOGIN LINK */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="underline underline-offset-4 decoration-[#C8A882] text-[#2C211B] hover:text-[#B58C79] font-serif text-xs transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>

            </form>
          </div>

        </div>

        {/* BOTTOM ACCENT FOOTER */}
        <footer className="mt-12 text-center text-[10px] text-[#AD9A8D] uppercase tracking-[0.3em] font-light">
          Redefined Luxury • Account Recovery Portal
        </footer>

      </main>
    </div>
  );
}