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
    <AuthLayout eyebrow="Password help" title="Reset your password" subtitle="Enter your email and we will send a secure reset link.">
      <form onSubmit={submit} className="space-y-5">
        <StatusMessage type="success">{message}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>
        <input className="field" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
        <Link to="/login" className="block text-center text-sm font-bold text-teal-700">
          Back to login
        </Link>
      </form>
    </AuthLayout>
  );
}
