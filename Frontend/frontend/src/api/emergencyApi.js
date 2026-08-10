import api from "./axios";

export const emergencyApi = {
  createEmergency: (userId, location) =>
    api.post("/api/emergency/create", { userId, ...location }),

  getEmergencyHistory: (userId) =>
    api.get(`/api/emergency/history/${userId}`),

  getEmergencyById: (emergencyId) => api.get(`/api/emergency/single/${emergencyId}`),

  getAllEmergencies: () =>
    api.get("/api/emergency/all"),

  acceptEmergency: (emergencyId, payload) =>
    api.put(`/api/emergency/accept/${emergencyId}`, payload),

  resolveEmergency: (emergencyId) =>
    api.put(`/api/emergency/resolve/${emergencyId}`),

  exportPdf: (emergencyId) =>
    api.get(`/api/emergency/${emergencyId}/export-pdf`, { responseType: "blob" }),
};