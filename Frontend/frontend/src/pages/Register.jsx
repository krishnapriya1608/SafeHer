import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import { roles } from "../utils/roles";
import registerImage from "../assets/side profile.jpg";

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
      setMessage(response.data.message || "Verification code sent to your email.");
      
      // Navigate to OTP verification page
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#526055] py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#2D332D] selection:bg-[#D4C5B9] selection:text-[#1F2420]">
      {/* Background Decorative Floral/Glow Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#EAE5D9_1px,transparent_1px)] [background-size:24px_24px]" />

      <main className="max-w-4xl mx-auto relative z-10">
        
        {/* TOP HERO HEADER - Editorial Serif Banner */}
        <header className="text-center mb-10 space-y-2">
          <span className="text-xs uppercase tracking-[0.3em] text-[#D9D2C5] font-light">
            Welcome & Well-being
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#F2EFE9] tracking-wide font-normal leading-tight">
            Nourish Your Safety & Peace of Mind
          </h1>
          <p className="text-xs sm:text-sm text-[#C2BCAE] italic font-serif max-w-md mx-auto">
            Create your account to connect with your personalized care network.
          </p>
        </header>

        {/* COLLAGE SECTION CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: IMAGE COLLAGE CARD */}
          <div className="lg:col-span-5 relative">
            <div className="bg-[#FAF8F5] p-4 shadow-xl border border-[#E3DDD3]">
              {/* Main Image Frame with Off-center Accent Frame */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#EAE5D9]">
                <img
                  src={registerImage}
                  alt="Wellness & Security"
                  className="w-full h-full object-cover grayscale-[15%] contrast-[95%] transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#526055]/10 mix-blend-multiply" />
              </div>

              {/* Decorative Quote / Label Box */}
              <div className="mt-4 pt-4 border-t border-[#E8E2D8] text-center">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A8A7C] font-semibold block mb-1">
                  Gentle Guidance
                </span>
                <p className="text-xs font-serif italic text-[#555E56]">
                  "A supportive space tailored to your individual journey."
                </p>
              </div>
            </div>

            
          </div>

          {/* RIGHT: MAIN FORM CONTAINER */}
          <div className="lg:col-span-7 bg-[#FAF8F5] p-6 sm:p-10 shadow-2xl border border-[#E3DDD3] relative">
            
            <div className="mb-6 pb-4 border-b border-[#E8E2D8]">
              <h2 className="text-xl font-serif text-[#2B332C] tracking-wide uppercase font-medium">
                Create Account
              </h2>
              <p className="text-xs text-[#6B756C] mt-1">
                Enter your details below to register your personal profile.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Alerts & Messages */}
              {message && <StatusMessage type="success">{message}</StatusMessage>}
              {error && <StatusMessage type="error">{error}</StatusMessage>}

              {/* INPUT FIELDS */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] font-medium text-[#4A544C] mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="e.g. johndoe"
                    value={form.username}
                    onChange={updateForm}
                    required
                    disabled={loading}
                    className="w-full bg-[#F4F1EA] border border-[#D8D0C3] px-4 py-2.5 text-sm text-[#2D332D] placeholder-[#A0988C] transition-all duration-200 focus:outline-none focus:border-[#526055] focus:bg-white focus:ring-1 focus:ring-[#526055] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] font-medium text-[#4A544C] mb-1.5">
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
                    className="w-full bg-[#F4F1EA] border border-[#D8D0C3] px-4 py-2.5 text-sm text-[#2D332D] placeholder-[#A0988C] transition-all duration-200 focus:outline-none focus:border-[#526055] focus:bg-white focus:ring-1 focus:ring-[#526055] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.15em] font-medium text-[#4A544C] mb-1.5">
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
                    className="w-full bg-[#F4F1EA] border border-[#D8D0C3] px-4 py-2.5 text-sm text-[#2D332D] placeholder-[#A0988C] transition-all duration-200 focus:outline-none focus:border-[#526055] focus:bg-white focus:ring-1 focus:ring-[#526055] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* ROLE SELECTION GRID */}
              <div className="pt-2">
                <label className="block text-[11px] uppercase tracking-[0.15em] font-medium text-[#4A544C] mb-2.5">
                  Select Your Role
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const isActive = form.role === role.value;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                        disabled={loading}
                        className={`text-left p-3.5 transition-all duration-200 border ${
                          isActive
                            ? "bg-[#EAE4D9] border-[#526055] shadow-sm"
                            : "bg-[#F4F1EA] border-[#E0D8CC] hover:bg-[#EDE8DE] hover:border-[#C7BDAD]"
                        }`}
                      >
                        <span
                          className={`block text-xs uppercase tracking-wider font-semibold ${
                            isActive ? "text-[#222B23]" : "text-[#5C665E]"
                          }`}
                        >
                          {role.label}
                        </span>
                        <span
                          className={`block text-[11px] mt-1 font-serif leading-tight ${
                            isActive ? "text-[#475249]" : "text-[#7A857C]"
                          }`}
                        >
                          {role.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4">
                <motion.button
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3B473E] text-[#F5F2EC] py-3 px-6 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:bg-[#2B352E] focus:outline-none focus:ring-2 focus:ring-[#526055] focus:ring-offset-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-[#F5F2EC]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </motion.button>
              </div>

              {/* FOOTER LINK */}
              <div className="text-center pt-2">
                <p className="text-xs text-[#6B756C]">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="underline underline-offset-4 decoration-[#948A7B] text-[#2B332C] hover:text-[#526055] font-serif transition-colors"
                  >
                    Login here
                  </Link>
                </p>
              </div>

            </form>
          </div>

        </div>

        {/* BOTTOM SECTION: EDITORIAL BANNER ACCENT */}
        <footer className="mt-12 text-center text-[11px] text-[#A8B2A9] uppercase tracking-[0.2em] font-light">
          Mind • Body • Soul • Security Network
        </footer>

      </main>
    </div>
  );
}