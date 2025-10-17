import axios from 'axios';

const API_URL = '/api';

// Net Operations
export const createNetOperation = async (data) => {
  const response = await axios.post(`${API_URL}/net-operations`, data);
  return response.data;
};

export const getNetOperations = async (params) => {
  const response = await axios.get(`${API_URL}/net-operations`, { params });
  return response.data;
};

export const getNetOperation = async (id) => {
  const response = await axios.get(`${API_URL}/net-operations/${id}`);
  return response.data;
};

export const updateNetOperation = async (id, data) => {
  const response = await axios.put(`${API_URL}/net-operations/${id}`, data);
  return response.data;
};

export const completeNetOperation = async (id) => {
  const response = await axios.put(`${API_URL}/net-operations/${id}/complete`);
  return response.data;
};

export const addCheckIn = async (id, data) => {
  const response = await axios.post(`${API_URL}/net-operations/${id}/checkins`, data);
  return response.data;
};

export const deleteCheckIn = async (netOpId, checkInId) => {
  const response = await axios.delete(`${API_URL}/net-operations/${netOpId}/checkins/${checkInId}`);
  return response.data;
};

export const lookupCallsign = async (callsign) => {
  const response = await axios.get(`${API_URL}/net-operations/lookup/${callsign}`);
  return response.data;
};

export const exportNetOperationPDF = async (id) => {
  const response = await axios.get(`${API_URL}/net-operations/${id}/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

export const deleteNetOperation = async (id) => {
  const response = await axios.delete(`${API_URL}/net-operations/${id}`);
  return response.data;
};

export const scheduleNetOperation = async (data) => {
  const response = await axios.post(`${API_URL}/net-operations/schedule`, data);
  return response.data;
};

export const startScheduledNet = async (id) => {
  const response = await axios.put(`${API_URL}/net-operations/${id}/start`);
  return response.data;
};

export const updateNetNotes = async (id, notes) => {
  const response = await axios.put(`${API_URL}/net-operations/${id}/notes`, { notes });
  return response.data;
};

export const updateCheckInNotes = async (netOpId, checkInId, notes) => {
  const response = await axios.put(`${API_URL}/net-operations/${netOpId}/checkins/${checkInId}/notes`, { notes });
  return response.data;
};

export const updateCheckInCommented = async (netOpId, checkInId, commented) => {
  const response = await axios.put(`${API_URL}/net-operations/${netOpId}/checkins/${checkInId}/commented`, { commented });
  return response.data;
};

// Settings
export const getSettings = async () => {
  const response = await axios.get(`${API_URL}/settings`);
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await axios.put(`${API_URL}/settings`, data);
  return response.data;
};

export const uploadLogo = async (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  const response = await axios.post(`${API_URL}/settings/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteLogo = async () => {
  const response = await axios.delete(`${API_URL}/settings/logo`);
  return response.data;
};

// Users (Admin)
export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(`${API_URL}/users`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/users/${userId}`);
  return response.data;
};

export const resetUserPassword = async (userId, newPassword) => {
  const response = await axios.put(`${API_URL}/users/${userId}/reset-password`, { newPassword });
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const response = await axios.put(`${API_URL}/users/${userId}/role`, { role });
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await axios.put(`${API_URL}/users/${userId}`, userData);
  return response.data;
};

export const generateOperationsReport = async (filters) => {
  const response = await axios.post(`${API_URL}/users/reports/generate`, filters, {
    responseType: 'blob'
  });
  return response.data;
};

