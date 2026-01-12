import api from './api';

export const familyApi = {
  // Get all families
  getAll: (params) => api.get('/families', { params }),
  
  // Get single family
  get: (id) => api.get(`/families/${id}`),
  
  // Create family
  create: (data) => api.post('/families', data),
  
  // Update family
  update: (id, data) => api.put(`/families/${id}`, data),
  
  // Delete family
  delete: (id) => api.delete(`/families/${id}`),
  
  // Change status
  changeStatus: (id, status) => api.patch(`/families/${id}/status`, { status }),
  
  // Update structure
  updateStructure: (id, familyUnits) => api.patch(`/families/${id}/structure`, { familyUnits }),
  
  // Get statistics
  getStats: (params) => api.get('/families/stats', { params }),
  
  // Get filter options
  getFilterOptions: (params) => api.get('/families/filter-options', { params }),
  
  // Get students by IDs
  getStudentsByIds: (studentIds) => api.post('/agendas/students/by-ids', { studentIds }),
  
  // Get users by IDs
  getUsersByIds: (userIds) => api.post('/agendas/users/by-ids', { userIds })
};