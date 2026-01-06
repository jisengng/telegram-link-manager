import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const linkApi = {
  // Get all links
  getAllLinks: () => api.get('/links'),

  // Search links
  searchLinks: (query, category, tags) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    if (tags && tags.length > 0) params.append('tags', tags.join(','));
    return api.get(`/links/search?${params.toString()}`);
  },

  // Get single link
  getLink: (id) => api.get(`/links/${id}`),

  // Update link
  updateLink: (id, data) => api.put(`/links/${id}`, data),

  // Delete link
  deleteLink: (id) => api.delete(`/links/${id}`),

  // Toggle complete status
  toggleComplete: (id) => api.post(`/links/${id}/toggle-complete`),

  // Get all tags
  getAllTags: () => api.get('/tags'),

  // Get all categories
  getCategories: () => api.get('/categories'),

  // Bulk operations
  bulkAddTags: (linkIds, tags) => api.post('/bulk/add-tags', { linkIds, tags }),
  bulkRemoveTags: (linkIds, tags) => api.post('/bulk/remove-tags', { linkIds, tags }),
  bulkDelete: (linkIds) => api.post('/bulk/delete', { linkIds })
};

export default api;
