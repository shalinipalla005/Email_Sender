import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add request interceptor for error handling
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Template APIs
export const templateApi = {
  getAll: () => api.get('/templates'),
  getById: (id) => api.get(`/templates/${id}`),
  getByCategory: (category) => api.get(`/templates/category/${category}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`)
};

// Email APIs
export const emailApi = {
  createCampaign: (data) => api.post('/emails/create', data),
  sendCampaign: (mailId) => api.post(`/emails/send/${mailId}`),
  addEmailConfig: (data) => api.post('/emails/add-email-config', data),
  getEmailConfigs: () => api.get('/emails/configs'),
  getSent: () => api.get('/emails/sent'),
  getStats: () => api.get('/emails/stats')
};

// Data APIs
export const dataApi = {
  uploadFile: (formData) => api.post('/data/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getPreview: (filename) => api.get(`/data/${filename}/preview`),
  deleteFile: (filename) => api.delete(`/data/${filename}`)
};

export default api; 