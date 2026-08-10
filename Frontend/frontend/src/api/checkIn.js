import api from "./axios";

export const checkInApi = {
  list: () => api.get("/api/checkins"),
  create: (payload) => api.post("/api/checkins", payload),
  toggle: (id) => api.patch(`/api/checkins/${id}/toggle`),
  remove: (id) => api.delete(`/api/checkins/${id}`),
  confirm: (id) => api.post(`/api/checkins/${id}/confirm`),
};
