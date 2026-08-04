import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({ baseURL: API_BASE });

export async function sendChatMessage(message, category, userId) {
  const res = await client.post("/ai-safety/chat", { message, category, userId });
  return res.data.data;
}

export async function fetchEmergencyContacts(country = "IN") {
  const res = await client.get("/ai-safety/emergency-contacts", { params: { country } });
  return res.data.data;
}

export async function fetchHistory(userId) {
  const res = await client.get(`/ai-safety/history/${userId}`);
  return res.data.data;
}
