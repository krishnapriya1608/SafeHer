// src/api/contactApi.js
import api from "./axios";

export const contactApi = {
  // GET all trusted contacts for a user
  getContacts: (userId) =>
    api.get(`/api/contacts/contact/${userId}`),

  // POST add a new trusted contact
  addContact: (userId, payload) =>
    api.post(`/api/contacts/contact/${userId}`, payload),

  // PUT edit an existing trusted contact
  editContact: (userId, contactId, payload) =>
    api.put(`/api/contacts/contact/${userId}/${contactId}`, payload),

  // DELETE a trusted contact
  deleteContact: (userId, contactId) =>
    api.delete(`/api/contacts/contact/${userId}/${contactId}`),

  // POST trigger emergency alert to all trusted contacts
  triggerEmergency: (userId, payload) =>
    api.post(`/api/emergency/${userId}`, payload),

  // PATCH a contact acknowledges receipt of an alert
  acknowledgeAlert: (alertId, contactId) =>
    api.patch(`/api/emergency/${alertId}/ack/${contactId}`),
};