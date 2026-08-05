import api from "./axios";

export async function sendChatMessage(message, category, userId) {
  const res = await api.post("/api/ai-safety/chat", { message, category, userId });
  return res.data.data;
}

export async function fetchEmergencyContacts(country = "IN") {
  const res = await api.get("/api/ai-safety/emergency-contacts", { params: { country } });
  return res.data.data;
}

export async function fetchHistory(userId) {
  const res = await api.get(`/api/ai-safety/history/${userId}`);
  return res.data.data;
}