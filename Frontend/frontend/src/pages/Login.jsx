import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roles";
import loginImage from "../assets/Logins.jpg";

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
      navigate(location.state?.from?.pathname || rolePath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFEB] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#3D332D] selection:bg-[#D2A895] selection:text-[#1F1916]">
      {/* Background Decorative Marble Texture / Light Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#C3B3A5_1px,transparent_1px)] [background-size:28px_28px]" />

      <main className="max-w-4xl mx-auto relative z-10">
        
        {/* TOP HERO HEADER - Warm Warm Serif Banner */}
        <header className="text-center mb-10 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[#A67863] font-semibold block">
            Ascend & Security
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#2C221E] tracking-wide font-normal leading-tight">
            Elevate Your Access.
          </h1>
          <p className="text-xs sm:text-sm text-[#7D6B60] italic font-serif max-w-md mx-auto">
            Securely sign in with your verified credentials to access your portal.
          </p>
        </header>

        {/* COLLAGE CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* LEFT: IMAGE CARD WITH SOFT FRAMING */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#FAF8F5] p-4 shadow-2xl border border-[#EBE3DA]">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#EFE9E2]">
                <img
                  src={loginImage}
                  alt="Secure Portal Access"
                  className="w-full h-full object-cover contrast-[98%] transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#B36A4C]/10 mix-blend-multiply" />
              </div>

              {/* Decorative Caption Box */}
              <div className="mt-4 pt-4 border-t border-[#EFE8E0] text-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B36A4C] font-semibold block mb-1">
                  Verified Portal
                </span>
                <p className="text-xs font-serif italic text-[#635349]">
                  "Empowering your digital presence with peace of mind."
                </p>
              </div>
            </div>

            {/* Accent Badge */}
            <div className="hidden sm:block absolute -bottom-4 -left-4 bg-[#B36A4C] text-[#FFFBF7] px-4 py-2 shadow-lg text-[10px] font-serif tracking-[0.2em] uppercase border border-[#A05A3E]">
              Secure Access
            </div>
          </div>

          {/* RIGHT: MAIN LOGIN FORM */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-6 sm:p-10 shadow-2xl border border-[#EBE3DA] relative">
            
            <div className="mb-6 pb-4 border-b border-[#EFE8E0]">
              <h2 className="text-xl font-serif text-[#2C221E] tracking-wide uppercase font-medium">
                Welcome Back
              </h2>
              <p className="text-xs text-[#7D6B60] mt-1">
                Please enter your email and password to log in.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Error Alert Box */}
              {error && <StatusMessage type="error">{error}</StatusMessage>}

              {/* INPUT FIELDS */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-[#66554B] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={updateForm}
                    required
                    disabled={loading}
                    className="w-full bg-[#F5EFEC] border border-[#E2D8CF] px-4 py-2.5 text-sm text-[#2C221E] placeholder-[#B0A296] transition-all duration-200 focus:outline-none focus:border-[#B36A4C] focus:bg-white focus:ring-1 focus:ring-[#B36A4C] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-[#66554B] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={updateForm}
                    required
                    disabled={loading}
                    className="w-full bg-[#F5EFEC] border border-[#E2D8CF] px-4 py-2.5 text-sm text-[#2C221E] placeholder-[#B0A296] transition-all duration-200 focus:outline-none focus:border-[#B36A4C] focus:bg-white focus:ring-1 focus:ring-[#B36A4C] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* FORGOT PASSWORD LINK */}
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-serif italic text-[#B36A4C] transition-colors hover:text-[#8C4E35] underline underline-offset-4 decoration-[#E2D8CF]"
                >
                  Forgot password?
                </Link>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2">
                <motion.button
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#B36A4C] text-[#FFFBF7] py-3 px-6 text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 hover:bg-[#9B5A3F] focus:outline-none focus:ring-2 focus:ring-[#B36A4C] focus:ring-offset-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-[#FFFBF7]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </div>

              {/* FOOTER LINK */}
              <div className="text-center pt-2">
                <p className="text-xs text-[#7D6B60]">
                  New here?{" "}
                  <Link
                    to="/register"
                    className="underline underline-offset-4 decoration-[#B36A4C] text-[#2C221E] hover:text-[#B36A4C] font-serif transition-colors"
                  >
                    Create account
                  </Link>
                </p>
              </div>

            </form>
          </div>

        </div>

        {/* BOTTOM ACCENT */}
        <footer className="mt-12 text-center text-[10px] text-[#A6978B] uppercase tracking-[0.3em] font-light">
          Ascend & Co. • Elevate Your Security
        </footer>

      </main>
    </div>
  );
}