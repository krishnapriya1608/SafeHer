import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";

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

  return (
    <AuthLayout 
      eyebrow="Password help" 
      title="Reset your password" 
      subtitle="Enter your email and we will send a secure reset link."
    >
      <form onSubmit={submit} className="space-y-5">
        
        {/* Success and Error Feedback Messages */}
        {message && <StatusMessage type="success">{message}</StatusMessage>}
        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {/* Email Input Field */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</label>
          <input 
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            type="email" 
            placeholder="you@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <button 
            className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/10 transition-all duration-200 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 active:bg-teal-800 disabled:pointer-events-none disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                {/* SVG Loading Spinner */}
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Sending...
              </span>
            ) : (
              "Send reset link"
            )}
          </button>
        </div>

        {/* Back to Login Anchor */}
        <div className="pt-1 text-center">
          <Link 
            to="/login" 
            className="inline-block text-sm font-semibold text-teal-600 transition-colors duration-150 hover:text-teal-700 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}