import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import verifyImage from "../assets/Community.png";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const verify = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authApi.verifyOtp({ email, otp });
      setMessage(response.data.message || "Account verified");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setMessage("");

    try {
      const response = await authApi.resendOtp({ email });
      setMessage(response.data.message || "OTP sent again");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f7efef] font-serif text-[#6d4c5d]">
      
      {/* LEFT SECTION: Full-height Hero Image Panel with Gold Frame */}
      <div className="w-full md:w-1/2 min-h-[300px] md:min-h-screen bg-[#f7efef] flex items-center justify-center p-8 md:p-16 border-r-0 md:border-r border-[#d3b482]/40 relative">
        <div className="relative w-full max-w-lg aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#d3b482] shadow-2xl">
          <div className="absolute inset-2 rounded-xl border border-[#d3b482]/40 pointer-events-none z-10" />
          <img
            src={verifyImage}
            alt="Verification visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* RIGHT SECTION: Full-height Form Panel */}
      <div className="w-full md:w-1/2 min-h-screen bg-[#916b7d] text-white flex flex-col justify-center px-8 sm:px-12 md:px-20 py-12 relative">
        
        {/* Subtle Decorative Border Frame Overlay */}
        <div className="absolute inset-4 sm:inset-6 rounded-2xl border border-[#d3b482]/30 pointer-events-none" />

        <div className="max-w-md w-full mx-auto space-y-8 z-10">
          {/* Header Typography */}
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] font-sans font-semibold text-[#d3b482]">
              Verify Email
            </span>
            <h1 className="text-3xl sm:text-4xl font-normal tracking-wide text-white">
              Enter Your Code
            </h1>
            <p className="text-sm font-sans text-[#f7efef]/80 leading-relaxed">
              Check your email inbox and enter the 6 digit verification code sent to your address.
            </p>
          </div>

          <form onSubmit={verify} className="space-y-6 font-sans">
            {/* Status Messages */}
            {message && <StatusMessage type="success">{message}</StatusMessage>}
            {error && <StatusMessage type="error">{error}</StatusMessage>}

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#f7efef]">
                  Email Address
                </label>
                <input
                  className="w-full rounded-xl border border-[#d3b482]/50 bg-[#f7efef] px-4 py-3 text-sm text-[#6d4c5d] placeholder-[#916b7d]/60 shadow-inner transition-all duration-200 focus:border-[#d3b482] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d3b482]/40 disabled:cursor-not-allowed disabled:opacity-60 font-serif"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-center text-xs font-semibold uppercase tracking-wider text-[#f7efef]">
                  Verification Code
                </label>
                <input
                  className="w-full rounded-xl border border-[#d3b482] bg-[#f7efef] px-4 py-3.5 text-center text-2xl font-bold tracking-[0.35em] text-[#6d4c5d] placeholder-[#916b7d]/40 shadow-inner transition-all duration-200 focus:border-[#d3b482] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d3b482]/40 disabled:cursor-not-allowed disabled:opacity-60 font-serif"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                className="w-full rounded-full bg-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#6d4c5d] shadow-lg border border-[#d3b482]/50 transition-all duration-200 hover:bg-[#f7efef] hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-[#d3b482] disabled:pointer-events-none disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin text-[#6d4c5d]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3 pt-2 text-center text-xs font-semibold uppercase tracking-wider sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={resend}
                className="text-[#d3b482] transition-colors duration-150 hover:text-white hover:underline focus:outline-none"
              >
                Resend OTP
              </button>

              <Link
                to="/login"
                className="text-[#f7efef]/80 transition-colors duration-150 hover:text-white hover:underline"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}