import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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
  send: (data) => api.post('/emails/send', data),
  getSent: () => api.get('/emails/sent'),
  getBatch: (id) => api.get(`/emails/batch/${id}`),
  getStats: () => api.get('/emails/stats'),
  processTemplate: (data) => api.post('/emails/process-template', data)
};

// Data APIs
export const dataApi = {
  uploadFile: (formData) => api.post('/data/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getFiles: () => api.get('/data'),
  getFile: (id) => api.get(`/data/${id}`),
  deleteFile: (id) => api.delete(`/data/${id}`),
  getPreview: (id) => api.get(`/data/${id}/preview`)
};

export default api; 