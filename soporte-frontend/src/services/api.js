/**
 * api.js
 * Centralized Axios instance with JWT injection and error normalization.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('soporte_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// Normalize error responses
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Unknown error';
    return Promise.reject(new Error(message));
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) =>
    apiClient.post('/users/auth/login', { email, password }).then((r) => r.data.data),
};

// ── Tickets ───────────────────────────────────────────────────────────────────
export const ticketsApi = {
  getAll: () =>
    apiClient.get('/tickets').then((r) => r.data.data),

  getById: (id) =>
    apiClient.get(`/tickets/${id}`).then((r) => r.data.data),

  create: (payload) =>
    apiClient.post('/tickets', payload).then((r) => r.data.data),

  escalar: (id) =>
    apiClient.patch(`/tickets/${id}/escalar`).then((r) => r.data.data),

  cerrar: (id) =>
    apiClient.patch(`/tickets/${id}/cerrar`).then((r) => r.data.data),

  downloadPdf: (id) =>
    apiClient.get(`/tickets/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),
};

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: () =>
    apiClient.get('/products').then((r) => r.data.data),
};

// ── Comments ──────────────────────────────────────────────────────────────────
export const commentsApi = {
  getByTicket: (ticketId) =>
    apiClient.get(`/comments/ticket/${ticketId}`).then((r) => r.data.data),

  create: (ticketId, content) =>
    apiClient.post('/comments', { ticketId, content }).then((r) => r.data.data),

  delete: (commentId) =>
    apiClient.delete(`/comments/${commentId}`),
};

export default apiClient;
