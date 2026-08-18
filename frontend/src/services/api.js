import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('classrank_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for clear error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth Services
export const authService = {
  registerStudent: (data) => api.post('/auth/student/register', data),
  loginStudent: (data) => api.post('/auth/student/login', data),
  loginAdmin: (data) => api.post('/auth/admin/login', data),
  getMe: () => api.get('/auth/me'),
};

// Student Services
export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Leaderboard Service
export const leaderboardService = {
  getLeaderboard: (params) => api.get('/leaderboard', { params }),
};

// Dashboard Stats Service
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

// Excel Service
export const excelService = {
  importFile: (formData, commit = false) => api.post(`/students/import?commit=${commit}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportExcel: () => {
    window.location.href = `${API_BASE_URL}/students/export`;
  }
};

// Settings Service
export const settingsService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

export default api;
