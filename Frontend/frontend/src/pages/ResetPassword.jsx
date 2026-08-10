import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import resetImage from "../assets/side profile.jpg"; 

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authApi.resetPassword(token, { password });
      setMessage(response.data.message || "Password updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#526055] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#2D332D] selection:bg-[#D4C5B9] selection:text-[#1F2420]">
      {/* Subtle Dot Matrix Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#EAE5D9_1px,transparent_1px)] [background-size:24px_24px]" />

      <main className="max-w-4xl mx-auto relative z-10">
        
        {/* TOP HERO HEADER */}
        <header className="text-center mb-10 space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#D9D2C5] font-light block">
            Account Security
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F2EFE9] tracking-wide font-normal leading-tight">
            Restore Your Peace of Mind
          </h1>
          <p className="text-xs sm:text-sm text-[#C2BCAE] italic font-serif max-w-md mx-auto">
            Choose a new secure password to finalize your account recovery.
          </p>
        </header>

        {/* COLLAGE SECTION CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* LEFT: BOTANICAL COLLAGE CARD */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#FAF8F5] p-4 shadow-xl border border-[#E3DDD3]">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#EAE5D9]">
                <img
                  src={resetImage}
                  alt="Security & Wellness"
                  className="w-full h-full object-cover contrast-[95%] transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#526055]/10 mix-blend-multiply" />
              </div>

              {/* Decorative Caption */}
              <div className="mt-4 pt-4 border-t border-[#E8E2D8] text-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A8A7C] font-semibold block mb-1">
                  Gentle Protection
                </span>
                <p className="text-xs font-serif italic text-[#555E56]">
                  "Your privacy and safety remain at the center of our work."
                </p>
              </div>
            </div>

            {/* Accent Badge Overlay */}
            <div className="hidden sm:block absolute -bottom-4 -left-4 bg-[#C5B39A] text-[#1F2420] px-4 py-2 shadow-lg text-[10px] font-serif tracking-widest uppercase border border-[#B3A086]">
              Secure Network
            </div>
          </div>

          {/* RIGHT: MAIN RESET PASSWORD FORM */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-6 sm:p-10 shadow-2xl border border-[#E3DDD3] relative">
            
            <div className="mb-6 pb-4 border-b border-[#E8E2D8]">
              <h2 className="text-xl font-serif text-[#2B332C] tracking-wide uppercase font-medium">
                Set New Password
              </h2>
              <p className="text-xs text-[#6B756C] mt-1">
                Enter your new password credentials below to proceed.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              
              {/* Success and Error Alerts */}
              {message && <StatusMessage type="success">{message}</StatusMessage>}
              {error && <StatusMessage type="error">{error}</StatusMessage>}

              {/* PASSWORD INPUT */}
              <div>
                <label className="block text-[11px] uppercase tracking-[0.15em] font-medium text-[#4A544C] mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-[#F4F1EA] border border-[#D8D0C3] px-4 py-3 text-sm text-[#2D332D] placeholder-[#A0988C] transition-all duration-200 focus:outline-none focus:border-[#526055] focus:bg-white focus:ring-1 focus:ring-[#526055] disabled:opacity-50"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <motion.button
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3B473E] text-[#F5F2EC] py-3.5 px-6 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:bg-[#2B352E] focus:outline-none focus:ring-2 focus:ring-[#526055] focus:ring-offset-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-[#F5F2EC]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    "Update Password"
                  )}
                </motion.button>
              </div>

              {/* BACK TO LOGIN LINK */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="underline underline-offset-4 decoration-[#948A7B] text-[#2B332C] hover:text-[#526055] font-serif text-xs transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>

            </form>
          </div>

        </div>

        {/* BOTTOM ACCENT FOOTER */}
        <footer className="mt-12 text-center text-[11px] text-[#A8B2A9] uppercase tracking-[0.2em] font-light">
          Mind • Body • Soul • Security Network
        </footer>

      </main>
    </div>
  );
}