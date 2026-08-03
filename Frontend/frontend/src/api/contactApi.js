import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getContacts = () => client.get('/contacts').then((r) => r.data);

export const addContact = (payload) => client.post('/contacts', payload).then((r) => r.data);

export const editContact = (id, payload) => client.put(`/contacts/${id}`, payload).then((r) => r.data);

export const deleteContact = (id) => client.delete(`/contacts/${id}`).then((r) => r.data);

export const triggerEmergency = (location) =>
  client.post('/contacts/emergency', location).then((r) => r.data);
