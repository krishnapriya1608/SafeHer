import api from "./axios";

export async function createOrder() {
  const res = await api.post("/api/subscription/create-order");
  return res.data.data; // { orderId, amount, currency, keyId }
}

export async function verifyPayment(payload) {
  // payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  const res = await api.post("/api/subscription/verify", payload);
  return res.data.data; // { plan, planExpiry }
}

export async function fetchSubscriptionStatus() {
  const res = await api.get("/api/subscription/status");
  return res.data.data; // { plan, planExpiry }
}
