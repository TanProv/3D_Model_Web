import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Models API
export const modelAPI = {
  // Get all models
  getAll: (params = {}) => {
    return api.get('/models', { params });
  },

  // Get model by ID
  getById: (id) => {
    return api.get(`/models/${id}`);
  },

  // Upload model
  upload: (formData) => {
    return api.post('/models/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update model
  update: (id, formData) => {
    return api.put(`/models/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete model
  delete: (id) => {
    return api.delete(`/models/${id}`);
  },

  // Search models
  search: (query) => {
    return api.get('/models/search', { params: { query } });
  },
};

// Jewelry API
export const jewelryAPI = {
  // Get all jewelry
  getAll: (params = {}) => {
    return api.get('/jewelry', { params });
  },

  // Get jewelry by ID
  getById: (id) => {
    return api.get(`/jewelry/${id}`);
  },

  // Create jewelry
  create: (data) => {
    return api.post('/jewelry', data);
  },

  // Update jewelry
  update: (id, data) => {
    return api.put(`/jewelry/${id}`, data);
  },

  // Delete jewelry
  delete: (id) => {
    return api.delete(`/jewelry/${id}`);
  },
};

// Helper function to get full URL for assets
export const getAssetUrl = (path) => {
  if (!path) return null;
  const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};

export default api;