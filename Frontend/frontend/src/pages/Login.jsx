import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roles";
import loginImage from '../assets/Logins.jpg';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateForm = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login(form);
      auth.login({ token: response.data.token, user: response.data.user });
      const rolePath = dashboardPathForRole(response.data.user?.role);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.user._id);
      localStorage.setItem("username", response.data.user.username);
      localStorage.setItem("email", response.data.user.email);
      console.log(response.data);
      console.log(response.data.user);
      navigate(location.state?.from?.pathname || rolePath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Reusable Tailwind utility classes for consistent input styling
  const inputClasses =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 " +
    "placeholder-slate-400 shadow-sm transition-all duration-200 " +
    "focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 " +
    "disabled:cursor-not-allowed disabled:opacity-60";

  

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Login securely"
      subtitle="Use your verified email and password to continue."
      image={loginImage}
      bggradient="sky"
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Error Alert Box */}
        {error && <StatusMessage type="error">{error}</StatusMessage>}

        {/* Input Fields Group */}
        <div className="space-y-4">
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

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-teal-600 transition-colors duration-150 hover:text-teal-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-1">
          <motion.button
            whileTap={!loading ? { scale: 0.985 } : {}}
            className="w-full rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-teal-600/10 transition-all duration-200 hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 active:bg-teal-800 disabled:pointer-events-none disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                {/* SVG Loading Spinner */}
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </motion.button>
        </div>

        {/* Form Footer Link */}
        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link
            className="font-semibold text-teal-600 transition-colors duration-150 hover:text-teal-700 hover:underline"
            to="/register"
          >
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}