import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import { roles } from "../utils/roles";
import registerImage from '../assets/side profile.jpg' // Keep your original asset

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateForm = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authApi.register(form);
      setMessage(response.data.message || "OTP sent successfully");
      
      // Keep original logic for OTP navigation
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ************************************************************
  // Tailored utility strings for the new EARTHY aesthetic
  // ************************************************************
  
  const inputClasses = 
    "w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm " +
    "text-[#2a2a2a] placeholder-[#9c9c9c] " + // Dark charcoal text
    "shadow-inner transition-all duration-200 " +
    "focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500/10 " + // Dusty green focus
    "disabled:cursor-not-allowed disabled:opacity-60";

  const labelClasses = 
    "mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500";

  const roleCardClasses = (isActive) =>
    `group relative flex flex-col text-left p-4 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:cursor-not-allowed ${
      isActive
        ? "border-slate-700 bg-white ring-1 ring-slate-700" // Dusty green border/shadow when active
        : "border-slate-200 bg-[#f5f1ea] hover:border-slate-300 hover:bg-[#eae6de]" // Earthy beige base
    }`;

  const roleTitleClasses = (isActive) =>
    `block text-sm font-bold font-serif transition-colors duration-200 ${
      isActive ? "text-[#2a2a2a]" : "text-[#5e5e5e]"
    }`;

  const roleDescClasses = (isActive) =>
    `mt-0.5 block text-[11px] leading-normal transition-colors duration-200 ${
      isActive ? "text-slate-600" : "text-slate-500"
    }`;

  // ************************************************************
  // ************************************************************

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join your safety network"
      subtitle="Register with your role, verify your email, and continue to your dashboard."
      image={registerImage}
      bggradient="none" // Use the default earthy bg from AuthLayout
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Alerts & Messages */}
        {message && <StatusMessage type="success">{message}</StatusMessage>}
        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {/* ************************************************************
           Input Fields Group - Now withserif typography and earth tones
           ************************************************************ */}
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>Username</label>
            <input 
              className={inputClasses}
              name="username" 
              type="text"
              placeholder="e.g. johndoe" 
              value={form.username} 
              onChange={updateForm} 
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClasses}>Email Address</label>
            <input 
              className={inputClasses}
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              value={form.email} 
              onChange={updateForm} 
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className={labelClasses}>Password</label>
            <input 
              className={inputClasses}
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={updateForm} 
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* ************************************************************
           Role Selection - Re-styled as beige cards with charcoal accents
           ************************************************************ */}
        <div className="space-y-2.5">
          <label className={labelClasses}>Select Your Role</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((role) => {
              const isActive = form.role === role.value;
              return (
                <button
                  type="button"
                  key={role.value}
                  onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                  disabled={loading}
                  className={roleCardClasses(isActive)}
                >
                  <span className={roleTitleClasses(isActive)}>
                    {role.label}
                  </span>
                  <span className={roleDescClasses(isActive)}>
                    {role.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ************************************************************
           Submit Action - Now a dark charcoal/dusty green block button
           ************************************************************ */}
        <div className="pt-2">
          <motion.button 
            whileTap={!loading ? { scale: 0.985 } : {}} 
            className="w-full rounded-md bg-slate-700 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-500/20 active:bg-slate-900 disabled:pointer-events-none disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Processing...
              </span>
            ) : (
              "Register"
            )}
          </motion.button>
        </div>

        {/* ************************************************************
           Footer Link - Re-styled as dark gray text
           ************************************************************ */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-slate-700 transition-colors duration-150 hover:text-slate-900 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}