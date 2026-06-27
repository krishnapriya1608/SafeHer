import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthLayout from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../utils/roles";

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
      navigate(location.state?.from?.pathname || rolePath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title="Login securely" subtitle="Use your verified email and password to continue.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <StatusMessage type="error">{error}</StatusMessage>
        <input className="field" name="email" type="email" placeholder="Email address" value={form.email} onChange={updateForm} />
        <input className="field" name="password" type="password" placeholder="Password" value={form.password} onChange={updateForm} />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-bold text-teal-700">
            Forgot password?
          </Link>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} className="btn-primary w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        <p className="text-center text-sm text-slate-600">
          New here?{" "}
          <Link className="font-bold text-teal-700" to="/register">
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
