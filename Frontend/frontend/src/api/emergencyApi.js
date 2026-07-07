import api from "./axios";

export const emergencyApi = {
  createEmergency: (payload) =>
    api.post("/api/emergency/create", payload),

  getEmergencyHistory: (userId) =>
    api.get(`/api/emergency/history/${userId}`),

  getAllEmergencies: () =>
    api.get("/api/emergency/all"),

  resolveEmergency: (emergencyId) =>
    api.put(`/api/emergency/resolve/${emergencyId}`),
};