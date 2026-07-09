import { useState } from "react";
import { Link } from "react-router-dom";
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-100 px-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        {/* Security Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v2H9v-2c0-1.657 1.343-3 3-3zm0 0V7a4 4 0 118 0v4"
              />

              <rect
                x="6"
                y="11"
                width="12"
                height="9"
                rx="2"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>


        {/* Heading */}
        <h1 className="mt-6 text-center text-3xl font-black text-slate-900">
          Forgot Password?
        </h1>

        <p className="mt-3 text-center text-sm leading-6 text-slate-500">
          Enter your registered email address and we will send
          you a secure password reset link.
        </p>


        <form
          onSubmit={submit}
          className="mt-8 space-y-5"
        >

          {message && (
            <StatusMessage type="success">
              {message}
            </StatusMessage>
          )}

          {error && (
            <StatusMessage type="error">
              {error}
            </StatusMessage>
          )}


          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="
                w-full rounded-xl border border-slate-200
                bg-white px-4 py-3 text-sm
                text-slate-900
                placeholder-slate-400
                shadow-sm
                transition
                focus:border-teal-500
                focus:outline-none
                focus:ring-4
                focus:ring-teal-500/10
              "
            />
          </div>


          {/* Button */}
          <button
            disabled={loading}
            className="
              flex w-full items-center justify-center
              rounded-xl bg-teal-600
              py-3 text-sm font-semibold
              text-white
              shadow-md shadow-teal-600/20
              transition
              hover:bg-teal-700
              disabled:opacity-50
            "
          >

            {loading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}

          </button>

        </form>


        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>

    </main>
  );
}