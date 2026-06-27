import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import { authApi } from "../api/authApi";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const verify = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authApi.verifyOtp({ email, otp });
      setMessage(response.data.message || "Account verified");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setMessage("");

    try {
      const response = await authApi.resendOtp({ email });
      setMessage(response.data.message || "OTP sent again");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP");
    }
  };

  return (
    <AuthLayout eyebrow="Verify email" title="Enter your OTP" subtitle="Check your email inbox and enter the 6 digit verification code.">
      <form onSubmit={verify} className="space-y-5">
        <StatusMessage type="success">{message}</StatusMessage>
        <StatusMessage type="error">{error}</StatusMessage>

        <input className="field" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="field text-center text-2xl font-black tracking-[0.35em]" maxLength="6" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} />

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="flex flex-col gap-3 text-center text-sm sm:flex-row sm:justify-between">
          <button type="button" onClick={resend} className="font-bold text-teal-700">
            Resend OTP
          </button>
          <Link to="/login" className="font-bold text-slate-700">
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
