import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import { roles } from "../utils/roles";

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
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Tailored Tailwind utility strings for input elements
  const inputClasses = 
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 " +
    "placeholder-slate-400 shadow-sm transition-all duration-200 " +
    "focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join your safety network"
      subtitle="Register with your role, verify your email, and continue to your dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Alerts & Messages */}
        {message && <StatusMessage type="success">{message}</StatusMessage>}
        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {/* Input Fields Group */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Username</label>
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</label>
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">Password</label>
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

        {/* Role Selection Blocks */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Your Role</label>
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((role) => {
              const isActive = form.role === role.value;
              return (
                <button
                  type="button"
                  key={role.value}
                  onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                  disabled={loading}
                  className={`group relative flex flex-col text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:cursor-not-allowed ${
                    isActive
                      ? "border-teal-600 bg-teal-50/40 ring-2 ring-teal-600"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  <span className={`block text-sm font-bold transition-colors duration-200 ${isActive ? "text-teal-900" : "text-slate-900"}`}>
                    {role.label}
                  </span>
                  <span className={`mt-1 block text-xs leading-normal transition-colors duration-200 ${isActive ? "text-teal-700" : "text-slate-500"}`}>
                    {role.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <motion.button 
            whileTap={!loading ? { scale: 0.985 } : {}} 
            className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/10 transition-all duration-200 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 active:bg-teal-800 disabled:pointer-events-none disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Creating account...
              </span>
            ) : (
              "Register"
            )}
          </motion.button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-teal-600 transition-colors duration-150 hover:text-teal-700 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}