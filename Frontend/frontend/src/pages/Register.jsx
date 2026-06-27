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

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Join your safety network"
      subtitle="Register with your role, verify your email, and continue to your dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <StatusMessage type="success">{message}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>

        <input className="field" name="username" placeholder="Username" value={form.username} onChange={updateForm} />
        <input className="field" name="email" type="email" placeholder="Email address" value={form.email} onChange={updateForm} />
        <input className="field" name="password" type="password" placeholder="Password" value={form.password} onChange={updateForm} />

        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((role) => (
            <button
              type="button"
              key={role.value}
              onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
              className={`role-card ${form.role === role.value ? "role-card-active" : ""}`}
            >
              <span className="block text-sm font-black text-slate-950">{role.label}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-600">{role.description}</span>
            </button>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.98 }} className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </motion.button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-bold text-teal-700" to="/login">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
