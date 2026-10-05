import api from './axios';

// Auth API
export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const registerApi = (userData) => api.post('/auth/register', userData);
export const firebaseAuthApi = (idToken) => api.post('/auth/firebase', { idToken });
export const getMeApi = () => api.get('/auth/me');

// Garments API
export const getGarmentsApi = (params) => api.get('/garments', { params });
export const getGarmentByIdApi = (id) => api.get(`/garments/${id}`);
export const createGarmentApi = (formData) =>
  api.post('/garments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateGarmentApi = (id, formData) =>
  api.put(`/garments/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteGarmentApi = (id) => api.delete(`/garments/${id}`);

// Measurements API
export const getMeasurementsApi = () => api.get('/measurements');
export const updateMeasurementsApi = (data) => api.put('/measurements', data);

// Recommendations API
export const getRecommendationsApi = (params) => api.get('/recommendations', { params });
export const getSizeRecommendationApi = () => api.get('/recommendations/size');

// Saved Looks API
export const getSavedLooksApi = () => api.get('/saved-looks');
export const getSavedLookByIdApi = (id) => api.get(`/saved-looks/${id}`);
export const createSavedLookApi = (data) => api.post('/saved-looks', data); // JSON body
export const deleteSavedLookApi = (id) => api.delete(`/saved-looks/${id}`);

// Analytics API
export const trackAnalyticsEventApi = (data) => api.post('/analytics/track', data);
export const getConversionAnalyticsApi = () => api.get('/analytics/conversions');

// Notifications API
export const sendNotificationApi = (data) => api.post('/notifications/send', data);
export const getNotificationsApi = () => api.get('/notifications');
export const markNotificationReadApi = (id) => api.put(`/notifications/${id}/read`);

// User Upload API
export const uploadUserPhotoApi = (formData) =>
  api.post('/user/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
