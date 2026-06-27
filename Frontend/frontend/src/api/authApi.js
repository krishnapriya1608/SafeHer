import api from "./axios";

// Change these paths if your Express routes use different names.
export const authApi = {
  register: (payload) => api.post("/api/user/register", payload),
  verifyOtp: (payload) => api.post("/api/user/verify-otp", payload),
  resendOtp: (payload) => api.post("/api/user/resend-otp", payload),
  login: (payload) => api.post("/api/user/login", payload),
  forgotPassword: (payload) => api.post("/api/user/forgot-password", payload),
  resetPassword: (token, payload) => api.post(`/api/user/reset-password/${token}`, payload),
};
