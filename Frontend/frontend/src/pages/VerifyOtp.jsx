import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";

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

  // Reusable Tailwind style for standard textual fields
  const inputClasses = 
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 " +
    "placeholder-slate-400 shadow-sm transition-all duration-200 " +
    "focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <AuthLayout 
      eyebrow="Verify email" 
      title="Enter your OTP" 
      subtitle="Check your email inbox and enter the 6 digit verification code."
    >
      <form onSubmit={verify} className="space-y-5">
        
        {/* Status Messaging Alerts */}
        {message && <StatusMessage type="success">{message}</StatusMessage>}
        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {/* Input Controls */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</label>
            <input 
              className={inputClasses} 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verification Code
            </label>
            <input 
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-center text-2xl font-black tracking-[0.35em] text-slate-900 placeholder-slate-300 shadow-inner transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60" 
              maxLength="6" 
              placeholder="000000" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <button 
            className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/10 transition-all duration-200 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 active:bg-teal-800 disabled:pointer-events-none disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>
        </div>

        {/* Footer Navigation Panel */}
        <div className="flex flex-col gap-3 pt-2 text-center text-sm sm:flex-row sm:justify-between">
          <button 
            type="button" 
            onClick={resend} 
            className="font-semibold text-teal-600 transition-colors duration-150 hover:text-teal-700 hover:underline focus:outline-none"
          >
            Resend OTP
          </button>
          
          <Link 
            to="/login" 
            className="font-semibold text-slate-500 transition-colors duration-150 hover:text-slate-700 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}