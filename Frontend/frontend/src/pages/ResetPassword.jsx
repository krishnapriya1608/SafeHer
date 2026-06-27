import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authApi.resetPassword(token, { password });
      setMessage(response.data.message || "Password updated");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout eyebrow="New password" title="Create a new password" subtitle="Choose a strong password for your account.">
      <form onSubmit={submit} className="space-y-5">
        <StatusMessage type="success">{message}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>
        <input className="field" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </button>
        <Link to="/login" className="block text-center text-sm font-bold text-teal-700">
          Back to login
        </Link>
      </form>
    </AuthLayout>
  );
}
