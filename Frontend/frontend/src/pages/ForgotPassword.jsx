import { useState } from "react";
import { Link } from "react-router-dom";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import bgImage from '../assets/forgotpsswd.jpg';

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
    eyebrow: "Password Reset",
    title: "Forgot Password",
    subtitle: "Enter your email address to receive a password reset link",
  };

  return (
    <main 
      className="min-h-screen w-full flex items-center justify-center  p-6 sm:p-12 lg:p-24 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-slate-900/60 to-teal-950/40 pointer-events-none z-0" />

      {/* Form Container (z-10 sits safely above the image overlay) */}
      <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-800/80 flex flex-col gap-8 relative z-10">
        
        {/* Header */}
        <div className="text-left">
          <span className="inline-block text-xs font-black uppercase tracking-[0.25em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full mb-3">
            {obj.eyebrow}
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {obj.title}
          </h2>
          <p className="mt-2.5 text-sm font-medium leading-relaxed text-slate-400">
            {obj.subtitle}
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-6">
          {message && <StatusMessage type="success">{message}</StatusMessage>}
          {error && <StatusMessage type="error">{error}</StatusMessage>}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-300">
              Email Address
            </label>
            <input
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3.5 text-sm text-white placeholder-slate-500 shadow-sm transition-all duration-200 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-teal-600/10 transition-all duration-200 hover:bg-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/20 active:bg-teal-700 disabled:pointer-events-none disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </span>
            ) : (
              "Send reset link"
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-block text-sm font-semibold text-teal-400 transition-colors duration-150 hover:text-teal-300 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}