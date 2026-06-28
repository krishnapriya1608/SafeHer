// src/api/dashboardApi.js
import api from "./axios";

export const dashboardApi = {
  createDashboard: (payload) =>
    api.post("/api/dashboard/create", payload),

  getDashboard: (userId) =>
    api.get(`/api/dashboard/${userId}`),

  updateProfile: (userId, payload) =>
    api.put(`/api/dashboard/profile/${userId}`, payload),

  addContact: (userId, payload) =>
    api.post(`/api/dashboard/contact/${userId}`, payload),

  deleteContact: (userId, contactId) =>
    api.delete(`/api/dashboard/contact/${userId}/${contactId}`),

  updateStatus: (userId, payload) =>
    api.put(`/api/dashboard/status/${userId}`, payload),
};